import assert from './utils/assert';

import { ROUTES } from './lib/constants';

import {
    HEADERS_TYPE,
    DEVICE_RESPONSE,
} from './lib/constants.d';

const Basestation: any = class{
    client: any;
    headers: HEADERS_TYPE;
    basestation: DEVICE_RESPONSE;

    constructor(client: any, basestation: DEVICE_RESPONSE){
        assert(basestation.deviceType === 'basestation', 'Device is not a basestation');

        this.client = client.client;
        this.headers = client.headers;
        this.basestation = basestation;
    }
}

export default Basestation;