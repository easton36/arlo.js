import assert from './utils/assert';

import { ROUTES } from './lib/constants';

import {
    HEADERS_TYPE,
    DEVICE_RESPONSE,
} from './lib/constants.d';

/**
 * @param client - Base arlo client instance
 * @param {DEVICE_RESPONSE} camera - device object to initiate
 */
const Camera: any = class{
    client: any;
    headers: HEADERS_TYPE;
    camera: DEVICE_RESPONSE;

    constructor(client: any, camera: DEVICE_RESPONSE){
        assert(camera.deviceType === 'camera' || camera.deviceType === 'doorbell', 'Device is not a camera or a doorbell');

        this.client = client.client;
        this.headers = client.headers;
        this.camera = camera;
    }

    /**
     * @param {string} name - name of the camera
     * @returns {Promise<string>}
    */
    public async setName(name: string): Promise<string>{
        let response = await this.client({
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
     * @param {Basestation} basestation - Basestation instance that the camera is connected to
     * @returns {Promise<string>}
    */
    public async startStream(basestation: any): Promise<string>{
        return '';
    }
}

export default Camera;