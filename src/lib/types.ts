export interface CONFIG{
    username: string;
    password: string;
    twoFactorType: string | boolean
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

export interface FRIEND_RESPONSE{
    ownerId: string;
    createdDate: number;
    token: string;
    firstName: string;
    lastName: string;
    lastModified: number;
    status: string;
    adminUser: boolean;
    email: string;
    id: string;
}

export interface PROFILE_RESPONSE{
    _type: string;
    firstName: string;
    lastName: string;
    language: string;
    country: string;
    acceptedPolicy: number;
    currentPolicy: number;
    validEmail: boolean;
}

export interface SESSION_RESPONSE{
    userId: string;
    email: string;
    token: string;
    paymentId: string;
    accountStatus: string;
    serialNumber: string;
    countryCode: string;
    tocUpdate: boolean;
    policyUpdate: boolean;
    validEmail: boolean;
    arlo: boolean;
    dateCreated: number;
}

export interface ACCOUNT_RESPONSE{
    userId: string;
    email: string;
    dateCreated: number;
    dateDeviceRegistered: number;
    countryCode: string;
    language: string;
    firstName: string;
    lastName: string;
    s3StorageId: string;
    tosVersion: string;
    tosAgreeDate: number;
    tosShownVersion: string;
    lastModified: number;
    accountStatus: string;
    paymentId: string;
    serialNumber: string;
    mobilePushData: {
        mobilePushOsMap: {
            android: {
                token: string;
                endpoint: string;
                createdDate: string;
                iosDebugModeFlag: boolean;
            }[]
        }
    },
    recycleBinQuota: number;
    favoriteQuota: number;
    validEmail: boolean;
    locationCreated: boolean;
    readyToClose: boolean;
    lastMessageTimeToBS: number;
}

export interface DEVICE_LOCATION_RESPONSE{

}

export interface DEVICE_RESPONSE{
    userId: string;
    deviceId: string;
    parentId: string;
    uniqueId: string;
    deviceType: string;
    deviceName: string;
    lastModified: number;
    xCloudId: string;
    lastImageUploaded: string;
    userRole: string;
    displayOrder: number;
    state: string;
    owner: {
        firstName: string;
        lastName: string;
        ownerId: string;
    },
    properties: {
        modelId: string;
        olsonTimeZone: string | null;
        hwVersion: string;
    },
    [key: string]: any;
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

export interface DEVICES_TYPE{
    [key: string]: string; //[device.uniqueId]: device.deviceName
}

export interface FRIEND_TYPE{
    ownerId: string;
    token: string;
    firstName: string;
    lastName: string;
    devices: DEVICES_TYPE;
    lastModified: number;
    adminUser: boolean;
    email: string;
    [key: string]: any;
}

export interface NOTIFY_PAYLOAD{
    action: string;
    resource: string;
    publishResponse: boolean;
    from?: string;
    to?: string;
    transId?: string;
    properties?: {
        [key: string]: any;
    }
}