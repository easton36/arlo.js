import { HEADERS_TYPE } from './types';

export const BASE_URL: string = 'https://my.arlo.com';
export const AUTH_URL: string = 'https://ocapi-app.arlo.com';
export const API_URL: string = `https://myapi.arlo.com`;

export const ROUTES: any = {
    LOGIN: `${AUTH_URL}/api/auth`,
    LOGOUT: `${API_URL}/hmsweb/logout`,
    GET_FACTORS: `${AUTH_URL}/api/getFactors`,
    START_AUTH: `${AUTH_URL}/api/startAuth`,
    FINISH_AUTH: `${AUTH_URL}/api/finishAuth`,

    DEVICE_BASE: `${API_URL}/hmsweb/users/devices`,
    GET_DEVICES: `${API_URL}/hmsweb/users/devices`,

    GET_FRIENDS: `${API_URL}/hmsweb/users/friends`,
    MODIFY_FRIEND: `${API_URL}/hmsweb/users/friends`,
    ADD_FRIEND: `${API_URL}/hmsweb/users/friends`,
    REMOVE_FRIEND: `${API_URL}/hmsweb/users/friends/remove`,

    GET_ACCOUNT: `${API_URL}/hmsweb/users/account`,
    GET_PROFILE: `${API_URL}/hmsweb/users/profile`,
    GET_SESSION: `${API_URL}/hmsweb/users/session/v2`, //v1 route returns error
    GET_DEVICE_LOCATIONS: `${API_URL}/hmsweb/users/locations`,

    CHANGE_EMAIL: `${AUTH_URL}/api/updateEmailCombined`,
    CHANGE_PASSWORD: `${API_URL}/hmsweb/users/changePassword`,
    UPDATE_PROFILE: `${API_URL}/hmsweb/users/profile`,
    SET_PRIMARY_FACTOR: `${AUTH_URL}/api/setPrimaryFactor`,
    START_PAIRING_FACTOR: `${AUTH_URL}/api/startPairingFactor`,
    FINISH_PAIRING_FACTOR: `${AUTH_URL}/api/finishPairingFactor`,
    REMOVE_FACTOR: `${AUTH_URL}/api/removeFactor`,

    SET_DEVICE_NAME: `${API_URL}/hmsweb/users/devices/renameDevice`,

    SUBSCRIBE_TO_STREAM: `${API_URL}/hmsweb/client/subscribe`,
    NOTIFY_DEVICE: `${API_URL}/hmsweb/users/devices/notify/`,

    RESTART_BASESTATION: `${API_URL}/hmsweb/users/devices/restart`,
};

export const AUTH_HEADERS: HEADERS_TYPE = {
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