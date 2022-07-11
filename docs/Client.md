## Constructor
### constructor(config)
 - `config` - An object containing your arlo account information.
   - `username` - Your Arlo username. Usually your account Email.
   - `password` - Your Arlo account password.
   - `twoFactorType` - What type of two factor authentication your Arlo account uses. Set to either `SMS` or `EMAIL`. Set to `false` if your account does not have 2FA. 

## Methods

### login()
This function will prompt you to enter your 2FA code in the terminal.

### logout()
This function will log you out of your Arlo account.

### getAccount()
This function will return your Arlo account information.

### getProfile()
This function will return your Arlo profile information.

### getSession()
This function will return your Arlo session information.

### getFriends()
This function will return your Arlo account friends.

### getTwoFactorMethods()
This function will return your Arlo account two factor methods.

### getDevices(deviceType, filterProvisioned)
This function will return your Arlo account devices.
 - `deviceType` - The type of device to return. Can be 'camera', 'doorbell', 'basestation'.
 - `filterProvisioned` - Boolean. Whether or not to filter out provisioned devices.

### getDevice(device)
This function will return a device from your Arlo account.
 - `device` - Device object. Any keys in this object will be used to filter out the list of devices

### getDeviceLocations()
This function will return your Arlo account device locations.

### changeEmail(email)
This function will change your Arlo account email.
 - `email` - The new email address.

### changePassword(password)
This function will change your Arlo account password.
 - `password` - The new password.

### updateProfile(firstName, lastName)
This function will update your Arlo account profile.
 - `firstName` - The new first name.
 - `lastName` - The new last name.

### setPrimaryTwoFactorMethod(factorId)
This function will set your Arlo account primary two factor method.
 - `factorId` - The ID of the two factor method. Can be fetched with [getTwoFactorMethods()](https://github.com/easton36/arlo.js/wiki/Client#getTwoFactorMethods).

### addTwoFactorMethod(factor, factorType)
This function will add a new two factor method to your Arlo account.
You will be prompted to enter the two factor code sent to your new method in the terminal.
 - `factor` - The two factor code.
 - `factorType` - The type of two factor method. Can be either `SMS` or `EMAIL`.

### removeTwoFactorMethod(factorId)
This function will remove a two factor method from your Arlo account.
 - `factorId` - The ID of the two factor method. Can be fetched with [getTwoFactorMethods()](https://github.com/easton36/arlo.js/wiki/Client#getTwoFactorMethods).

### addFriend(email, firstName, lastName, devices, admin)
This function will add a new friend to your Arlo account.
 - `email` - The email address of the friend.
 - `firstName` - The first name of the friend.
 - `lastName` - The last name of the friend.
 - `devices` - An object of devices to share with the friend. Device IDs can be fetched with [getDevices()](https://github.com/easton36/arlo.js/wiki/Client#getDevices).
   - [Device Id]: [Device Name]
 - `admin` - Boolean. Whether or not the friend should be an admin of the account.
