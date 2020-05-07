# EPNS Mobile App
Mobile App of EPNS protocol. The app is built on react native and is used to deliver push notification messages to the user. To know more about EPNS and the general specs, please jump to [EPNS General Specs](https://github.com/ethereum-push-notification-system/epns-specs/blob/master/README.md).

# Technical Details
Following definitions are used in the rest of the spec to refer to a particular category or service.
| Term  | Description |
| ------------- | ------------- |
| Device Token | These are token ids generated by Apple or Google (and are not crypto tokens) whenever an app registers for push notification, Learn about [Apple Device Tokens](https://developer.apple.com/documentation/usernotifications/registering_your_app_with_apns) or [Google Device Tokens](https://developers.google.com/web/ilt/pwa/introduction-to-push-notifications) |

### Features
The EPNS Mobile App serves to deliver push notification messages to the users that they have subscribed to.
- App should be able to recieve push notifications
- App should be able to connect user's wallet (singular at the moment) in a secure manner
- App Should connect this user wallet to the push notification tokens that are generated by Apple Push Notification Service or Android Push Notification Service
- App should be able to send this information to the epns server in a secure format
- App should be able to fetch user notifications (kind of like emails) which were already delivered to them

### Tech Spec
Mobile push notifications use device tokens for registration of the device and the push notification server then sends out mass or specific messages using these device tokens. For EPNS to work, we need to register these device tokens as well as the wallet to which they belong to.

For the EPNS Service to work, the following modules needs to be build:
- Storing User Wallet Private Key (Offline on the User's Device)
- Mapping user's wallet address to **device tokens**
- Communicate with the epns server to verify and store these **device tokens** (mapped to wallet address)
- Handling Incoming Push Notifications
- Fetching Previous Notifications of the User

#### Storing User Wallet Private Key (Offline on the User's Device)
The app needs to store the user's wallet private key to decrypt the message recieved by the user and to encrypt the token registration process. This ensures that the epns server only maps the verified **device tokens** to the Wallet of the user.

Furthermore, we need to provide either biometric or passcode based security to the user in the app since the app is storing sensitive user credentials. We will also be storing these user credentials in encrypted format, we will mostly be using [React-Native-Keychain](https://github.com/oblador/react-native-keychain) for this.

#### Mapping user's wallet address to device tokens
Once a user have imported the wallet, the device tokens which are generated would be mapped to the wallet of the user.

#### Communicate with the epns server to verify and store these device tokens (mapped to wallet address)
We will mostly be using [Eth-Crypto](https://github.com/pubkey/eth-crypto) to handle the secure verification process.

Current proposal is to send the operation code as **Register** along with the device token, the signature of the user using the above library and the public wallet address. The server will first decrypt the hash to find the public wallet address of the user and will only proceed if the public wallet address sent matches with the decrypted address of the public wallet. This ensure that spoofing can't be done by any users to recieve notifications meant for the intended recipients.

To know more about server and it's architecture, please head to [epns-push-notification-server repo] (https://github.com/ethereum-push-notification-system/epns-push-notification-server).

#### Handling Incoming Push Notifications
The push notification handling (for when the app is open) will also be built to handle notifications recieved by the users when they are inside the app.

#### Fetching Previous Notifications of the User
TBA, We are still contemplating storing a cache on the epns server or handle it alternatively.

### Payloads
**Incoming Notification Payload**
| Name  | Type | Description | In Case of Encryption |
| ------------- | ------------- | ------------- |  ------------- |
| title | *string* | App Owner Name - Title of message | App Owner Name has sent you a message! |
| body | *string* | The intended message | Please open EPNS app to view it. |
| icon | *url* | The App Owner Icon | Not Applicable |
| data | *json* | The data payload that will be handled by EPNS App | Some Parts are encrypted |

**JSON Payload (data of Incoming Notification Payload)**
| Name  | Type | Description | In Case of Encryption |
| ------------- | ------------- | ------------- |  ------------- |
| type | *integer* | (1 - Not Encrypted, 2 - Encrypted) | Not Applicable |
| epoch | *integer* | The timestamp in epoch when retrieved from blockchain | Not Applicable |
| app | *string* | The name of app owner | Not Applicable |
| icon | *url* | The icon of app owner | Not Applicable |
| url | *url* | The url of app owner | Not Applicable |
| secret | *string* | The secret protected by public key encryption, can't be more than 15 characters | Encrypted |
| msgdata | *json (stringified)* | Push Notification real data send either encrypted or unencrypted | Encrypted |
| >>sub | *string (Optional)* | Subject of message | Encrypted |
| >>msg | *string* | The intended of message | Encrypted |
| >>cta | *url (Optional)* | The call to action url (if any) | Encrypted |
| >>img | *url (Optional)* | The image to display with the message (if any) | Encrypted |

**Note:** The entire load is encrypted if notification type is 2 (Encrypted)

**Proposed DB (Mobile Device) to Handle Incoming Payloads**
| Name  | Type | Description |
| ------------- | ------------- | ------------- |
| nid | *integer | Primary Key Not Null Integer |
| app | *string* | The name of the app owner |
| icon | *string (url)* | The icon of the app owner |
| url | *url* | The url of app owner |
| type | *integer* | The type of notification (1 is unencrypted, 2 is encrypted) |
| appbot | *bool* | The message is sent from inside the app or from push notification |
| secret | *string* | The secret which needs to be decrypted and used as seed for AES encrypted msgdata |
| msgdata | *json* | The entire JSON payload as described above |
| hidden | *bool* | The message if hidden from device |
| epoch | *integer* | The timestamp of the message |