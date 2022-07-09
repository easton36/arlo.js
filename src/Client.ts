import axios, { AxiosResponse } from 'axios';
import { wrapper } from 'axios-cookiejar-support';
import { CookieJar } from 'tough-cookie';
import * as readline from 'readline-sync';
import assert from './utils/assert';

import { ROUTES, BASE_URL } from './lib/constants';

import { 
    LOGIN_RESPONSE, 
    HEADERS_TYPE, 
    FACTOR_TYPE, 
    DEVICES_TYPE,
    FRIEND_RESPONSE,
    PROFILE_RESPONSE,
    SESSION_RESPONSE,
    ACCOUNT_RESPONSE,
    DEVICE_RESPONSE,
    DEVICE_LOCATION_RESPONSE
} from './lib/constants.d';

/**
 * @param {string} username - Arlo username
 * @param {string} password - Arlo password
 * @param {string} twoFactorType - Optional. Two factor type. Either sms or email
 */
const Client: any = class{
    username: string;
    password: string;
    twoFactorType: string | boolean;
    headers: HEADERS_TYPE;
    userId: string;
    CookieJar: CookieJar;
    client: any;

    constructor(username: string, password: string, twoFactorType: string | boolean = false) {
        if(twoFactorType && (twoFactorType !== 'sms' && twoFactorType !== 'email')){
            throw new Error('Invalid twoFactorType. Choose either sms or email');
        }

        this.CookieJar = new CookieJar();
        this.client = wrapper(axios.create({ jar: this.CookieJar }));

        this.username = username;
        this.password = password;
        this.twoFactorType = twoFactorType;

        this.headers = {};
        this.userId = '';
    }
    /**
     * Login to Arlo Cloud
    */
    public async login(): Promise<LOGIN_RESPONSE> {
        if(this.twoFactorType && typeof this.twoFactorType === 'string'){
            let response = await this.loginMfa(this.username, this.password, this.twoFactorType);     
            return response;       
        } else{
            let response = await this.loginStandard(this.username, this.password);
            return response;
        }
    }

    /**
     * Login to Arlo Cloud
     * @param {string} username - Arlo username
     * @param {string} password - Arlo password
    */
    private async loginStandard(username: string, password: string): Promise<LOGIN_RESPONSE> {
        let base64Password: string = new (Buffer as any).from(password, 'utf8').toString('base64');

        //fetch initial data
        await axios.options(ROUTES.LOGIN, {
            headers: {
                'Access-Control-Request-Headers': 'content-type,source,x-user-device-id,x-user-device-name,x-user-device-type',
                'Access-Control-Request-Method': 'POST',
                'Origin': `${BASE_URL}`,
                'Referer': `${BASE_URL}/`,
                'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_1_2 like Mac OS X) AppleWebKit/604.3.5 (KHTML, like Gecko) Mobile/15B202 NETGEAR/v1 (iOS Vuezone)',
            }
        });

        // authenticate
        let response: AxiosResponse = await this.client({
            method: 'POST',
            url: ROUTES.LOGIN, 
            data: {
                EnvSource: 'prod',
                language: 'en',
                email: username,
                password: base64Password,
            },
            headers: {
                'DNT': '1',
                'schemaVersion': '1',
                'Auth-Version': '2',
                'Content-Type': 'application/json; charset=UTF-8',
                'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_1_2 like Mac OS X) AppleWebKit/604.3.5 (KHTML, like Gecko) Mobile/15B202 NETGEAR/v1 (iOS Vuezone)',
                'Origin': `${BASE_URL}`,
                'Referer': `${BASE_URL}/`,
                'Source': 'arloCamWeb',
            }
        });

        //validate response
        assert(response.data.meta.code === 200, JSON.stringify(response.data.meta));

        let loginResponse: LOGIN_RESPONSE = response.data;

        this.userId = loginResponse.data.userId;
        this.headers['Authorization'] = loginResponse.data.token;

        return loginResponse;
    }

    /**
     * Login to arlo if your account has 2FA enabled
     * @param {string} username - Arlo username
     * @param {string} password - Arlo password
     * @param {string} twoFactorType - Arlo two factor type. Accepts sms or email
    */
    private async loginMfa(username: string, password: string, twoFactorType: string): Promise<LOGIN_RESPONSE> {
        let base64Password: string = new (Buffer as any).from(password, 'utf8').toString('base64');

        let headers: HEADERS_TYPE = {
            'DNT': '1',
            'schemaVersion': '1',
            'Auth-Version': '2',
            'Content-Type': 'application/json; charset=UTF-8',
            'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_1_2 like Mac OS X) AppleWebKit/604.3.5 (KHTML, like Gecko) Mobile/15B202 NETGEAR/v1 (iOS Vuezone)',
            'Origin': `${BASE_URL}`,
            'Referer': `${BASE_URL}/`,
            'Source': 'arloCamWeb',
            'TE': 'Trailers',
        };

        // authenticate
        let authResponse: AxiosResponse = await this.client({
            method: 'POST',
            url: ROUTES.LOGIN,
            data: {
                EnvSource: 'prod',
                language: 'en',
                email: username,
                password: base64Password,
            },
            headers: headers
        });
        //validate response
        assert(authResponse.data.meta.code === 200, JSON.stringify(authResponse.data.meta));

        let authResponseData: LOGIN_RESPONSE = authResponse.data;

        this.userId = authResponseData.data.userId;
        
        let token = authResponseData.data.token;
        this.headers['Authorization'] = new (Buffer as any).from(token, 'utf8').toString('base64');

        //get email factor id
        let factorsResponse: AxiosResponse = await this.client({
            method: 'GET',
            url: ROUTES.GET_FACTORS,
            params: {
                data: authResponseData.data.issued
            },
            headers: {
                ...headers,
                ...this.headers
            }
        });
        
        //validate response
        assert(factorsResponse.data.meta.code === 200, JSON.stringify(factorsResponse.data.meta));

        let factorItems: FACTOR_TYPE[] = factorsResponse.data.data.items;
        let primaryFactorType: FACTOR_TYPE | undefined = factorItems.find((factor: any) => factor.factorType === twoFactorType.toUpperCase() && factor.factorRole === 'PRIMARY');

        assert(primaryFactorType, 'No primary two factor authentication method found/supported');

        //start factor auth
        let startFactorResponse: AxiosResponse = await this.client({
            method: 'POST',
            url: ROUTES.START_AUTH,
            data: {
                factorId: primaryFactorType.factorId,
            },
            headers: {
                ...headers,
                ...this.headers
            }
        });

        //validate response
        assert(startFactorResponse.data.meta.code === 200, JSON.stringify(startFactorResponse.data.meta));
        
        let factorAuthCode: string = startFactorResponse.data.data.factorAuthCode;
        assert(factorAuthCode, 'No factor auth code found');

        //get factor auth code from user
        let mfaCode: string = readline.question('Enter the MFA code sent to you:\n'); 
        assert(mfaCode, 'No 2FA code entered');

        //finish factor auth
        let finishFactorResponse: AxiosResponse = await this.client({
            method: 'POST',
            url: ROUTES.FINISH_AUTH,
            data: {
                factorAuthCode: factorAuthCode,
                otp: mfaCode
            },
            headers: {
                ...headers,
                ...this.headers
            }
        });

        //validate response
        assert(finishFactorResponse.data.meta.code === 200, JSON.stringify(finishFactorResponse.data.meta));

        this.headers = {
            'Auth-Version': '2',
            'Authorization': finishFactorResponse.data.data.token,
            'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_1_2 like Mac OS X) AppleWebKit/604.3.5 (KHTML, like Gecko) Mobile/15B202 NETGEAR/v1 (iOS Vuezone)',
        };

        return finishFactorResponse.data.data;
    }

    /**
     * Logout from arlo
    */
    public async logout(): Promise<void> {
        let response = await axios.put(ROUTES.LOGOUT);

        return response.data.data;
    }

    /**
     * Get arlo account information
     * @returns {ACCOUNT_RESPONSE} Arlo account information
    */
    public async getAccount(): Promise<ACCOUNT_RESPONSE> {
        let response = await axios.get(ROUTES.GET_ACCOUNT, {
            headers: this.headers
        });

        assert(response.data.success, 'Failed to get account information');

        return response.data.data;
    }

    /**
     * Get profile information
     * @returns {Promise<PROFILE_RESPONSE>} Profile information
     * @throws {Error} If an error occurs
    */
    public async getProfile(): Promise<PROFILE_RESPONSE> {
        let response: AxiosResponse = await this.client.get(ROUTES.GET_PROFILE, {
            headers: this.headers
        });

        assert(response.data.success, 'Failed to get profile');

        return response.data.data;
    }

    /**
     * Get session information
     * @returns {Promise<SESSION_RESPONSE>} Session information
     * @throws {Error} If an error occurs
    */
    public async getSession(): Promise<SESSION_RESPONSE> {
        let response: AxiosResponse = await this.client.get(ROUTES.GET_SESSION, {
            headers: this.headers
        });

        assert(response.data.success, 'Failed to get session');

        return response.data.data;
    }

    /**
     * Get arlo account friends
     * @returns {Promise<FRIEND_RESPONSE[]>} Arlo account friends
    */
     public async getFriends(): Promise<FRIEND_RESPONSE[]> {
        let response: AxiosResponse = await this.client.get(ROUTES.GET_FRIENDS, {
            headers: this.headers
        });

        assert(response.data.success, 'Failed to get friends');

        return response.data.data;
    }

    /**
     * Add a new friend to your account
     * @param {string} email - email address of friend to add
     * @param {string} firstName - first name of friend to add
     * @param {string} lastName - last name of friend to add
     * @param {DEVICES_TYPE} devices - Object containing devices to give access to
     * @param {boolean} admin - Optional. If true, friend will be given admin access to your account
    */
    public async addFriend(email: string, firstName: string, lastName: string, devices: DEVICES_TYPE, admin: boolean = false): Promise<FRIEND_RESPONSE> {
        let response: AxiosResponse = await this.client({
            method: 'POST',
            url: ROUTES.ADD_FRIEND,
            data: {
                adminUser: admin,
                firstName: firstName,
                lastName: lastName,
                email: email,
                devices: devices // { "device uniqueId": "device Name" }
            },
            headers: this.headers
        });

        assert(response.data.success, JSON.stringify(response.data.data));

        return response.data;
    }

    /**
     * Get arlo account devices
     * @param {[string]} deviceType - Optional. Filter devices by device type. Example: ['basestation', 'camera']
     * @param {boolean} filterProvisioned - Optional. Filter devices by provisioned status. A null value will return all devices.
     * @returns {Promise<DEVICE_RESPONSE[]>} Arlo account devices
    */
    public async getDevices(deviceType?: string[], filterProvisioned?: boolean): Promise<DEVICE_RESPONSE[]> {
        let response: AxiosResponse = await this.client.get(ROUTES.GET_DEVICES, {
            headers: this.headers,
        });

        assert(response.data.success, 'Failed to get devices');

        let devices: DEVICE_RESPONSE[] = response.data.data;

        if(deviceType && deviceType.length > 0){
            devices = devices.filter(device => deviceType.includes(device.deviceType));
        }
        if(typeof filterProvisioned === 'boolean'){
            if(filterProvisioned){
                devices = devices.filter(device => device.state === 'provisioned');
            } else {
                devices = devices.filter(device => device.state !== 'provisioned');
            }
        }

        return devices;
    }

    /**
     * Get specific arlo device
     * @param {Object: DEVICE_RESPONSE} device - Device to get. Include as many device properties as you want to filter for.
     * @returns {Promise<DEVICE_RESPONSE>} Arlo device
     * @throws {Error} If an error occurs
    */
    public async getDevice(device: DEVICE_RESPONSE): Promise<DEVICE_RESPONSE> {
        let devices: DEVICE_RESPONSE[] = await this.getDevices();

        let chosenDevice: DEVICE_RESPONSE | undefined = devices.find(dev => {
            for(let key in device){
                if(device[key] !== dev[key]){
                    return false;
                }
            }
            return true;
        });

        assert(chosenDevice, 'Failed to get device with given properties');

        return chosenDevice;
    }

    /**
     * Get arlo device locations
     * @returns {Promise<DEVICE_LOCATION_RESPONSE>} Device locations
    */
    public async getDeviceLocations(): Promise<DEVICE_LOCATION_RESPONSE> {
        let response: AxiosResponse = await this.client.get(ROUTES.GET_DEVICE_LOCATIONS, {
            headers: this.headers
        });

        assert(response.data.success, 'Failed to get device locations');

        return response.data;
    }


}

export default Client;