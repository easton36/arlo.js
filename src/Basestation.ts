import { EventEmitter } from 'events';
import { AxiosResponse } from 'axios';
import Camera from './Camera';

import assert from './utils/assert';
import { createTransactionId } from './utils/helpers';

import { ROUTES } from './lib/constants';

import {
    HEADERS_TYPE,
    DEVICE_RESPONSE,
    NOTIFY_PAYLOAD,
    EVENT_STREAM_RESPONSE,
    START_STREAM_RESPONSE
} from './lib/types';

const Basestation: any = class extends EventEmitter{
    client: any;
    userId: string;
    headers: HEADERS_TYPE;
    basestation: DEVICE_RESPONSE;
    streaming: boolean;
    pingInterval: NodeJS.Timer | null;

    constructor(client: any, basestation: DEVICE_RESPONSE){
        super();
        assert(basestation.deviceType === 'basestation', 'Device is not a basestation');

        this.client = client.client;
        this.userId = client.userId;
        this.headers = client.headers;
        this.basestation = basestation;
        this.streaming = false;
        this.pingInterval = null;
    }

    /**
     * Send a command to the basestation (control cameras, etc)
     * @param {NOTIFY_PAYLOAD} payload - payload to send to the basestation
     * @returns {Promise<void>}
    */
    public notifyDevice(payload: NOTIFY_PAYLOAD): Promise<void>{
        return new Promise<void>(async (resolve, reject) => {
            if(!this.streaming){
                await this.startStream();
            }
            let transId = createTransactionId();

            let response: AxiosResponse = await this.client({
                method: 'POST',
                url: ROUTES.NOTIFY_DEVICE + this.basestation.deviceId,
                data: {
                    ...payload,
                    to: this.basestation.deviceId,
                    from: this.userId + '_web',
                    transId: transId
                },
                headers: {
                    ...this.headers,
                    xcloudId: this.basestation.xCloudId,
                }
            });

            //response.data = {success: true};
            let processData = (data: any) => {
                if(data.transId === transId){
                    this.removeListener('message', processData);
                    resolve(data);
                }
            };
    
            this.on('message', processData);
        });
    }

    /**
     * Ping the basestation, keeps the event stream alive
    */
    private async ping(): Promise<void>{
        let data = await this.notifyDevice({
            action: 'set',
            resource: `subscriptions/${this.userId}_web`,
            publishResponse: false,
            properties: {
                devices: [this.basestation.deviceId]
            }
        });

        this.emit('pong', data);
    }

    /**
     * Start event stream for the basestation 
    */
    public async startStream(): Promise<void>{
        this.streaming = true;

        let response: AxiosResponse = await this.client.get(ROUTES.SUBSCRIBE_TO_STREAM, {
            headers: {
                ...this.headers,
                xcloudId: this.basestation.xCloudId,
                Accept: 'text/event-stream'
            },
            responseType: 'stream'
        });

        let stream = response.data;

        stream.on('data', (data: any) => this.message(data));
        stream.on('error', (error: any) => this.error(error));

        //ping event stream every 30 seconds
        this.pingInterval = setInterval(() => this.ping(), 30 * 1000);

        return;
    }

    private message(event: Buffer): boolean{
        let data = JSON.parse(event.toString().replace('event: message\ndata: ', '').replace('\n\n\n', ''));

        if(data?.status === 'connected'){
            return this.emit('open', 'Event stream opened');
        }

        return this.emit('message', data);
    }

    private error(error: any): boolean{
        this.streaming = false;
        return this.emit('error', error);
    }

    /**
     * Closes the event stream
     * @returns {Promise<void>}
    */
    public async close(): Promise<void>{
        this.emit('close', 'Event stream closed');
    }

    /**
     * Get the current basestation state 
    */
     public async getState(): Promise<void>{
        let data = await this.notifyDevice({
            action: 'get',
            resource: 'basestation',
            publishResponse: false
        });

        return data;
    }

    /**
     * Get the current state of the cameras attached to the basestation
    */
    public async getCamerasState(): Promise<void>{
        let data = await this.notifyDevice({
            action: 'get',
            resource: 'camera',
            publishResponse: false
        });

        return data;
    }
    
    /**
     * Restart basestation
    */
    public async restart(): Promise<void>{
        let response: AxiosResponse = await this.client({
            method: 'POST',
            url: ROUTES.RESTART_BASESTATION,
            body: {
                deviceId: this.basestation.deviceId,
            },
            headers: this.headers,
        });

        return response.data;
    }

    /**
     * Enables receiving alerts when any camera attached to the basestation is triggered
     * Enables the 'motionAlert' event for the basestation.
    */
    public enableMotionAlerts(): boolean{
        this.on('message', (data: any) => {
            if(data?.properties?.motionDetected){
                this.emit('motionAlert', data);
            }
        });

        return true;
    }

    /**
     * Create a custom mode
     * @param {string} mode - The name of the mode
     * @returns {Promise<EVENT_STREAM_RESPONSE>}
    */
    public async createCustomMode(mode: string): Promise<void>{
        let data = await this.notifyDevice({
            from: this.userId + '_web',
            to: this.basestation.parentId,
            action: 'set',
            resource: 'modes',
            transId: createTransactionId(),
            publishResponse: true,
            properties: {
                active: mode,
            }
        });

        return data;
    }

    /**
     * Arm the cameras attached to the basestation
     * @returns {Promise<EVENT_STREAM_RESPONSE>}
    */
    public async arm(): Promise<void>{
        let data = await this.createCustomMode('mode1');

        return data;
    }

    /**
     * Disarm the cameras attached to the basestation
     * @returns {Promise<EVENT_STREAM_RESPONSE>}
    */
    public async disarm(): Promise<void>{
        let data = await this.createCustomMode('mode0');

        return data;
    }

    /**
     * Adjust the brightness of a cameras attached to the basestation
     * @param {Camera} camera - An Arlo.js instance of the camera
     * @param {number} brightness - The brightness level. Between -2 and 2, and increments of 1.
     * @returns {Promise<EVENT_STREAM_RESPONSE>}
    */
    public async setBrightness(camera: typeof Camera, brightness: number): Promise<void>{
        let data = await this.notifyDevice({
            action: 'set',
            resource: 'cameras/' + camera.camera.deviceId,
            publishResponse: true,
            properties: {
                brightness: brightness
            }
        });

        return data;
    }

    /**
     * Toggle a camera on or off
     * @param {Camera} camera - An Arlo.js instance of the camera
     * @param {boolean} on - Whether to turn the camera on or off
     * @returns {Promise<EVENT_STREAM_RESPONSE>}
    */
    public async setCameraOn(camera: typeof Camera, on: boolean): Promise<void>{
        let data = await this.notifyDevice({
            action: 'set',
            resource: 'cameras/' + camera.camera.deviceId,
            publishResponse: true,
            properties: {
                privacyActive: on
            }
        });

        return data;
    }

    /**
     * Start streaming a camera connected to the basestation
     * @param {Camera} camera - An Arlo.js instance of the camera
     * @returns {Promise<START_STREAM_RESPONSE>} - Includes the url of the stream
    */
    public async startStreaming(camera: typeof Camera): Promise<START_STREAM_RESPONSE>{
        let response: AxiosResponse = await this.client({
            method: 'POST',
            url: ROUTES.START_STREAM,
            data: {
                to: camera.camera.parentId,
                from: this.userId + '_web',
                resource: 'cameras/' + camera.camera.deviceId,
                action: 'set',
                responseUrl: '',
                publishResponse: true,
                transId: createTransactionId(),
                properties: {
                    activityState: 'startUserStream',
                    cameraId: camera.camera.deviceId,
                }
            },
            headers: {
                ...this.headers,
                xcloudId: camera.camera.xCloudId,
                'Content-Type': 'application/json',
            }
        });

        assert(response.data.success, 'Failed to start streaming');

        return response.data.data;
    }
}

export default Basestation;