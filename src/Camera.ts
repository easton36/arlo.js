import { AxiosResponse } from 'axios';
import { CookieJar } from 'tough-cookie';

import assert from './utils/assert';
import { createTransactionId } from './utils/helpers';

import { ROUTES } from './lib/constants';

import {
    HEADERS_TYPE,
    DEVICE_RESPONSE,
    START_STREAM_RESPONSE
} from './lib/types';

/**
 * @param client - Base arlo client instance
 * @param {DEVICE_RESPONSE} camera - device object to initiate
 */
const Camera: any = class{
    client: any;
    userId: string;
    headers: HEADERS_TYPE;
    camera: DEVICE_RESPONSE;
    CookieJar: CookieJar;

    constructor(client: any, camera: DEVICE_RESPONSE){
        assert(camera.deviceType === 'camera' || camera.deviceType === 'doorbell', 'Device is not a camera or a doorbell');

        this.client = client.client;
        this.userId = client.userId;
        this.headers = client.headers;
        this.camera = camera;
        this.CookieJar = client.CookieJar;
    }

    /**
     * @param {string} name - name of the camera
     * @returns {Promise<string>}
    */
    public async setName(name: string): Promise<string>{
        let response: AxiosResponse = await this.client({
            method: 'PUT',
            url: ROUTES.SET_DEVICE_NAME, 
            data: {
                deviceId: this.camera.deviceId,
                deviceName: name,
                parentId: this.camera.parentId,
            },
            headers: this.headers,
        });

        assert(response.data.success, 'Failed to set name');

        this.camera.deviceName = name;

        return response.data.data;
    }

    /**
     * Get the camera's smart alerts
    */
    public async getSmartAlerts(): Promise<void>{
        let response: AxiosResponse = await this.client.get(`${ROUTES.DEVICE_BASE}/${this.camera.deviceId}/smartslerts`, {
            headers: this.headers,
        });

        console.log(response.data);

        return response.data;
    }

    /**
     * Get the camera's automation activity zones 
    */
    public async getAutomationActivityZones(): Promise<void>{
        let response: AxiosResponse = await this.client.get(`${ROUTES.DEVICE_BASE}/${this.camera.deviceId}/automation/activityzones`, {
            headers: this.headers,
        });

        console.log(response.data);

        return response.data;
    }

    /**
     * Talk through the camera's speakers
    */
    public async pushToTalk(): Promise<void>{
        let response: AxiosResponse = await this.client.get(`${ROUTES.DEVICE_BASE}/${this.camera.uniqueId}/pushtotalk`, {
            headers: this.headers,
        });

        console.log(response.data);

        return response.data;
    }

    /**
     * Start streaming the camera's video
     * @returns {Promise<START_STREAM_RESPONSE>} - Includes the url of the RTSP stream
    */
    public async startStreaming(): Promise<START_STREAM_RESPONSE>{
        let response: AxiosResponse = await this.client({
            method: 'POST',
            url: ROUTES.START_STREAM,
            data: {
                to: this.camera.parentId,
                from: this.userId + '_web',
                resource: 'cameras/' + this.camera.deviceId,
                action: 'set',
                responseUrl: '',
                publishResponse: true,
                transId: createTransactionId(),
                properties: {
                    activityState: 'startUserStream',
                    cameraId: this.camera.deviceId,
                }
            },
            headers: {
                ...this.headers,
                xcloudId: this.camera.xCloudId,
                'Content-Type': 'application/json',
            }
        });

        assert(response.data.success, 'Failed to start streaming');

        return response.data.data;
    }
}

export default Camera;