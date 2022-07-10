import { EventEmitter } from 'events';
import EventSource from 'eventsource';
import { AxiosResponse } from 'axios';
import { CookieJar } from 'tough-cookie';

import assert from './utils/assert';
import { createTransactionId } from './utils/helpers';

import { ROUTES, AUTH_URL } from './lib/constants';

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
    CookieJar: CookieJar;
    events: EventSource | null;

    constructor(client: any, basestation: DEVICE_RESPONSE){
        super();
        assert(basestation.deviceType === 'basestation', 'Device is not a basestation');

        this.client = client.client;
        this.userId = client.userId;
        this.headers = client.headers;
        this.basestation = basestation;
        this.CookieJar = client.CookieJar;
        this.events = null;

        console.log(this.headers);
        console.log(this.CookieJar.getCookieStringSync(AUTH_URL))
    }

    /**
     * Send a command to the basestation (control cameras, etc)
     * @param {NOTIFY_PAYLOAD} payload - payload to send to the basestation
     * @returns {Promise<void>}
    */
    public notifyDevice(payload: NOTIFY_PAYLOAD): Promise<void>{
        return new Promise<void>(async (resolve, reject) => {
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
    
            console.log(response.data);
        });
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

        console.log(response.data);
        return response.data;
    }

    /**
     * Start event stream for the basestation 
    */
    public async startStream(): Promise<void>{
        this.events = new EventSource(`${ROUTES.SUBSCRIBE_TO_STREAM}?token=${this.headers['Authorization']}`, {
            headers: {
                'Cookie': this.CookieJar.getCookieStringSync(AUTH_URL)
            }
        });

        this.events.onopen = this.open;
        this.events.onmessage = (event: MessageEvent) => this.message(event);
        this.events.onerror = (error: MessageEvent) => this.error(error);
    }

    private open(): void{
        this.emit('open', 'Event stream opened');
    }

    private async message(event: MessageEvent): Promise<void>{
        this.emit('message', event);
    }

    private async error(error: MessageEvent): Promise<void>{
        this.emit('error', error);
    }

    /**
     * Closes the event stream
     * @returns {Promise<void>}
    */
    public async close(): Promise<void>{
        this.events?.close();
        this.emit('close', 'Event stream closed');
    }

    /**
     * @param {boolean} enabled - enable or disable motion alerts
     */
    public async toggleMotionAlerts(enabled: boolean): Promise<void>{
    }
}

export default Basestation;