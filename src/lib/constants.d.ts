export interface ROUTES_TYPE {
    LOGIN: string;
    LOGOUT: string;
    GET_FACTORS: string;
    START_AUTH: string;
    FINISH_AUTH: string;
}

export interface LOGIN_RESPONSE{
    meta: {
        code: number;
    },
    data: {
        userId: string;
        token: string;
        mfa: boolean;
        issued: number;
        [key: string]: any;
    }
}

export interface HEADERS_TYPE {
    [key: string]: string;
}

export interface FACTOR_TYPE {
    _type: string;
    factorId: string;
    factorType: string;
    displayName: string;
    factorNickname: string;
    applicationId: string;
    applicationName: string;
    factorRole: string;
    [key: string]: any;
}