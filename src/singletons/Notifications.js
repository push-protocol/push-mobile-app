import messaging from '@react-native-firebase/messaging';

import FeedDBHelper from 'src/helpers/FeedDBHelper';
import MetaStorage from 'src/singletons/MetaStorage';

import GLOBALS from 'src/Globals';

// STATIC SINGLETON
export default class Notifications {
  static instance = Notifications.instance || new Notifications();

  // VARIBALES
  state = {

  }

  // INITIALIZE
  initialize = async () => {
    // For Initialization of anything, not needed right now

  }

  // Request Device Token
  requestDeviceToken = async () => {
    messaging()
      .getToken()
      .then(token => {
        this.saveDeviceToken(token);
      });
  }

  // Save Device Token
  saveDeviceToken = async (token) => {
    // Add the token to the users datastore
    console.log("Token Recieved:" + token);
    const previousToken = await MetaStorage.instance.getPushToken();

    if (previousToken !== token) {
      // This is a new token, save it
      await MetaStorage.instance.setPushToken(token);

      // Also flag for server
      await MetaStorage.instance.setTokenServerSynced(false);
    }
  }

  // Associate Token
  associateToken = async () => {
    // Associate token with server
    const sentToServer = await MetaStorage.instance.getPushTokenSentToServerFlag();

    if (!sentToServer) {
      // Send it to sever and set server flag as true
      await MetaStorage.instance.setTokenServerSynced(true);
    }
  }

  // Disassociate Generated Token
  dissaociateToken = async (wallet) => {
    // Dissassociate token with server

    // Set Token Server Status as False
    await MetaStorage.instance.setTokenServerSynced(false);
  }

}
