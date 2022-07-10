import { Client, Camera } from '../index';

const config = {
    username: 'test@hello.com', 
    password: 'myPassword123', 
    twoFactorType: 'email'
};

(async ()=>{
    const arlo = new Client(config);
    await arlo.login();

    let device = await arlo.getDevice({
        deviceType: 'camera',
        deviceName: 'Front Entrance'
    });

    let camera = new Camera(arlo, device);

    let success = await camera.setName('Front Door');

    console.log(success);
})();