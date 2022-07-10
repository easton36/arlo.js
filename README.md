# Arlo.js
A library to interact with [Arlo](https://www.arlo.com/en-us/) systems written in Typescript

  ![License](https://img.shields.io/github/license/easton36/arlo.js)
  ![Version](https://img.shields.io/npm/v/arlo.js)
  ![Downloads](https://img.shields.io/npm/dt/arlo.js)

### Library is currently a work in progress. Most of the features are not yet implemented.

Lots of thanks to [Arlo.py](https://github.com/jeffreydwalter/arlo)! I don't have to do nearly as much reverse engineering thanks to them.

```js
const { Client, Camera, Basestation } = require('arlo.js');

const credentials = {
    username: 'Your-Username',
    password: 'Your-Password',
    twoFactorMethod: 'Your-TwoFactorMethod',
};

(async ()=>{
    const arlo = new Client(credentials);
    await arlo.login();

    let profile = await arlo.getProfile();
    console.log(profile);
})();
```

## Installation
Installation is done using the
[`npm install` command](https://docs.npmjs.com/getting-started/installing-npm-packages-locally):

```console
$ npm install arlo.js
```

## Documentation
Documentation will be available on the [Github Wiki](https://github.com/easton36/arlo.js/wiki)

## Examples
View the [examples](https://github.com/easton36/arlo.js/tree/master/examples)! Feel free to fork and submit your own!