import { EventEmitter } from 'events';
import axios, { AxiosResponse } from 'axios';
import { wrapper } from 'axios-cookiejar-support';
import { CookieJar } from 'tough-cookie';
import * as readline from 'readline-sync';
import assert from './utils/assert';

import { ROUTES, BASE_URL } from './lib/constants';

import { LOGIN_RESPONSE, HEADERS_TYPE, FACTOR_TYPE } from './lib/constants.d';

const Client: any = class extends EventEmitter {
    username: string;
    password: string;
    twoFactorType: string | boolean;
    headers: HEADERS_TYPE;
    userId: string;
    CookieJar: CookieJar;
    client: any;

    constructor(username: string, password: string, twoFactorType: string | boolean = false) {
        super();
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

        if(this.twoFactorType && typeof this.twoFactorType === 'string'){
            this.loginMfa(this.username, this.password, this.twoFactorType);            
        } else{
            this.login(this.username, this.password);
        }
    }

    private async login(username: string, password: string): Promise<LOGIN_RESPONSE> {
        try{
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

            let loginResponse: LOGIN_RESPONSE = response.data;

            this.userId = loginResponse.data.userId;
            this.headers['Authorization'] = loginResponse.data.token;

            return loginResponse;
        } catch(err: any){
            throw new Error(`[ERROR] ` + err?.response?.data || err?.response || err);
        }
    }

    private async loginMfa(username: string, password: string, twoFactorType: string): Promise<LOGIN_RESPONSE> {
        try{
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
            assert(factorsResponse.data.meta.code === 200, JSON.stringify(authResponse.data.meta));

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
            assert(startFactorResponse.data.meta.code === 200, JSON.stringify(authResponse.data.meta));
            
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
            assert(finishFactorResponse.data.meta.code === 200, JSON.stringify(authResponse.data.meta));

            this.headers = {
                'Auth-Version': '2',
                'Authorization': finishFactorResponse.data.token,
                'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_1_2 like Mac OS X) AppleWebKit/604.3.5 (KHTML, like Gecko) Mobile/15B202 NETGEAR/v1 (iOS Vuezone)',
            };

            return finishFactorResponse.data.data;
        } catch(err: any){
            throw new Error(`[ERROR] ` + err?.response?.data || err?.response || err);
        }
    }

    public async logout(): Promise<void> {
        try{
            let response = await axios.put(ROUTES.LOGOUT);

            return response.data.data;
        } catch(err: any){
            throw new Error(`[ERROR] ` + err?.response?.data || err?.response || err);
        }
    }
}

export default Client;