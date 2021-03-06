
/**
 * Creates a transaction id. Pulled directly from the arlo website.
 * @param {string} type - type of transaction id. default = 'web'
 * @returns {string} - transaction id
*/
//function is at https://my.arlo.com/main.3d29c1296e09eafd6b1f.js
export function createTransactionId(type: string = 'web'): string{
    return `${type}!${(Math.random() * Math.pow(2, 32)).toString(16)}!${Date.now()}`;
}

/**
 * Creates a special authorization token used to interact with https://ocapi-app.arlo.com while logged in.
 * @param {string} token - Authorization token
 * @returns {string} - Special Authorization header
*/
//function is at https://my.arlo.com/main.3d29c1296e09eafd6b1f.js
export function createSpecialAuthToken(token: string): string{
    return Buffer.from((unescape(encodeURIComponent(token))), 'utf8').toString('base64');
};