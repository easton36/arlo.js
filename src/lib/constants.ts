import { ROUTES_TYPE } from './constants.d';

export const BASE_URL: string = 'https://my.arlo.com';
export const AUTH_URL: string = 'https://ocapi-app.arlo.com';
export const API_URL: string = `https://myapi.arlo.com`;

export const ROUTES: ROUTES_TYPE = {
    LOGIN: `${AUTH_URL}/api/auth`,
    LOGOUT: `${API_URL}/hmsweb/logout`,
    GET_FACTORS: `${AUTH_URL}/api/getFactors`,
    START_AUTH: `${AUTH_URL}/api/startAuth`,
    FINISH_AUTH: `${AUTH_URL}/api/finishAuth`,
};