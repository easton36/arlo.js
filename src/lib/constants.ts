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

    GET_DEVICES: `${API_URL}/hmsweb/users/devices`,

    GET_FRIENDS: `${API_URL}/hmsweb/users/friends`,
    MODIFY_FRIEND: `${API_URL}/hmsweb/users/friends`,
    ADD_FRIEND: `${API_URL}/hmsweb/users/friends`,
    REMOVE_FRIEND: `${API_URL}/hmsweb/users/friends/remove`,

    GET_ACCOUNT: `${API_URL}/hmsweb/users/account`,
    GET_PROFILE: `${API_URL}/hmsweb/users/profile`,
    GET_SESSION: `${API_URL}/hmsweb/users/session/v2`, //v1 route returns error
    GET_DEVICE_LOCATIONS: `${API_URL}/hmsweb/users/locations`,

    SET_DEVICE_NAME: `${API_URL}/hmsweb/users/devices/renameDevice`,
};