import {Platform} from 'react-native';

import ENV_CONFIG from 'src/env.config';

import firebase from '@react-native-firebase/app';
import messaging from '@react-native-firebase/messaging';
import CryptoHelper from 'src/helpers/CryptoHelper';
import MetaStorage from 'src/singletons/MetaStorage';
import Notify from 'src/singletons/Notify';
// Download Helper Function
const ServerHelper = {
  // Associate a device token to server
  associateTokenToServerNoAuth: async wallet => {
    // Associate token with server
    const apiURL =
      ENV_CONFIG.EPNS_SERVER + ENV_CONFIG.ENDPOINT_REGISTER_NO_AUTH;

    // prepare payloads
    const token = await MetaStorage.instance.getPushToken();
    const platform = Platform.OS;

    return await fetch(apiURL, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        op: 'register',
        device_token: token,
        wallet: wallet,
        platform: platform,
      }),
    })
      .then(response => response.json())
      .then(async authResponse => {
        console.log(authResponse);
        if (authResponse.success) {
          await MetaStorage.instance.setTokenServerSynced(true);
        }
      })
      .catch(error => {
        console.warn(error);
        return error;
      });
  },
  // Associate a device token to server
  associateTokenToServer: async (publicKey, privateKey) => {
    // Associate token with server
    const sentToServer =
      await MetaStorage.instance.getPushTokenSentToServerFlag();
    const debug = 0;

    if (!sentToServer || debug) {
      const authResponse = await ServerHelper.getAuthTokenFromServer(publicKey);
      debug ? console.log(authResponse) : null;

      if (authResponse.success) {
        // Use private key to decrypt the password
        const secret = await CryptoHelper.decryptWithECIES(
          authResponse.secret_enc,
          privateKey,
        );
        debug ? console.log(secret) : null;

        // Send for registration
        const regResponse = await ServerHelper.registerDeviceTokenToServer(
          authResponse.server_token,
          secret,
        );
        debug ? console.log(regResponse) : null;

        if (regResponse.success) {
          //console.log(regResponse);

          // Finally Adjust the flag
          await MetaStorage.instance.setTokenServerSynced(true);
        }
      }
    }
  },
  // Get auth token from server
  getAuthTokenFromServer: async publicKey => {
    const apiURL = ENV_CONFIG.EPNS_SERVER + ENV_CONFIG.ENDPOINT_AUTHTOKEN;

    return await fetch(apiURL, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        public_key: publicKey,
      }),
    })
      .then(response => response.json())
      .then(responseJson => {
        return responseJson;
      })
      .catch(error => {
        console.warn(error);
        return error;
      });
  },
  // Register device token to server
  registerDeviceTokenToServer: async (server_token, secret) => {
    const apiURL = ENV_CONFIG.EPNS_SERVER + ENV_CONFIG.ENDPOINT_REGISTER;

    // prepare payloads
    const token = await MetaStorage.instance.getPushToken();
    const platform = Platform.OS;

    const op_aes = CryptoHelper.encryptWithAES('register', secret);
    const device_token_aes = CryptoHelper.encryptWithAES(token, secret);
    const platform_aes = CryptoHelper.encryptWithAES(platform, secret);

    return await fetch(apiURL, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        server_token: server_token,
        op_aes: op_aes,
        device_token_aes: device_token_aes,
        platform_aes: platform_aes,
      }),
    })
      .then(response => response.json())
      .then(responseJson => {
        return responseJson;
      })
      .catch(error => {
        console.warn(error);
        return error;
      });
  },
  // Disassociate Generated Token from server, should not be talking to server, this
  // should be handled from the device itself
  dissaociateTokenFromServer: async wallet => {
    // FIREBASE
    // because of Firebase-react-native issue, call permissions again and again
    // Dissassociate token with server | BUGGY wasted my time
    const response = await messaging().deleteToken();

    // because of Firebase-react-native issue, call permissions again and again
    await messaging().requestPermission();

    // Checking
    // messaging()
    //   .getToken()
    //   .then(token => {
    //     Notify.instance.saveDeviceToken(token);
    //   });

    // Reset Push Notifications
    await MetaStorage.instance.setTokenServerSynced(false);
    await MetaStorage.instance.setPushToken('');
    await MetaStorage.instance.setCurrentAndPreviousBadgeCount(0, 0);

    // Set Token Server Status as False
    await MetaStorage.instance.setTokenServerSynced(false);
  },
};

export default ServerHelper;
