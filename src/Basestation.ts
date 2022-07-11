import { EventEmitter } from 'events';
import { AxiosResponse } from 'axios';

import assert from './utils/assert';
import { createTransactionId } from './utils/helpers';

import { ROUTES } from './lib/constants';

import {
    HEADERS_TYPE,
    DEVICE_RESPONSE,
    NOTIFY_PAYLOAD
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
    
            this.on('message', (data: any) => {
                if(data.transId === transId){
                    resolve(data);
                }
            });
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
     * Get the current basestation state 
    */
    public async getState(): Promise<void>{
        let data = await this.notifyDevice({
            action: 'get',
            resource: 'basestation',
            publishResponse: false
        });

        return data;
    };

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
}

export default Basestation;