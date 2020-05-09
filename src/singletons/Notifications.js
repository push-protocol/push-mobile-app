import messaging from '@react-native-firebase/messaging';

import FeedDBHelper from 'src/helpers/FeedDBHelper';
import MetaStorage from 'src/singletons/MetaStorage';

import GLOBALS from 'src/Globals';

// STATIC SINGLETON
export default class Notifications {
  static instance = Notifications.instance || new Notifications();

  // VARIBALES
  state = {
    notificationListenerCB: null
  }

  // INITIALIZE
  initialize = async () => {
    // For Initialization of anything, not needed right now

  }

  // Request Device Token
  requestDeviceToken = async (onlySignedIn) => {
    if (onlySignedIn) {
      const signedin = await MetaStorage.instance.getIsSignedIn();

      if (!signedin) {
        return false;
      }
    }


    const status = await messaging().hasPermission();
    if (status == messaging.AuthorizationStatus.AUTHORIZED) {
      messaging()
        .getToken()
        .then(token => {
          this.saveDeviceToken(token);
        });
      }
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
    // Reset Push Notifications
    await MetaStorage.instance.setTokenServerSynced(false);
    await MetaStorage.instance.setPushToken('');
    await MetaStorage.instance.setCurrentAndPreviousBadgeCount(0, 0);

    // Set Token Server Status as False
    await MetaStorage.instance.setTokenServerSynced(false);
  }

  // Handle incoming notification Foreground
  handleIncomingPushAppOpened = async (remoteMessage) => {
    console.log("Notification Handled From Foreground!");
    await this.handleIncomingPush(remoteMessage);

    // Listen for callbacks, etc as well
    if (this.state.notificationListenerCB) {
      this.state.notificationListenerCB();
    }
  }

  // Handle incoming notification Background
  handleIncomingPushAppInBG = async (remoteMessage) => {
    console.log("Notification Handled From Background!");
    await this.handleIncomingPush(remoteMessage);
  }

  // Default behavior for any incoming notification
  handleIncomingPush = async (remoteMessage) => {
    // Check if the payload has data
    const payload = remoteMessage["data"];
    if (payload["type"]) {
      // Assume message exists and proceed
      await FeedDBHelper.addFeedFromPayload(
        payload["sid"],
        payload["type"],
        payload["app"],
        payload["icon"],
        payload["url"],
        false,
        payload["secret"],
        payload["asub"],
        payload["amsg"],
        payload["acta"],
        payload["aimg"],
        "0",
        payload["epoch"],
      );
    }

    // console.log("Notification Handled!");
    // console.log(remoteMessage);

    // Trigger Notification Callback
    this.triggerNotificationListenerCallback();
  }

  // To subscribe to notification recieved
  setNotificationListenerCallback = (callback) => {
    this.state.notificationListenerCB = callback;
  }

  // Trigger Notication Listener Callback
  triggerNotificationListenerCallback = () => {
    if (this.state.notificationListenerCB) {
      // Callback
      this.state.notificationListenerCB();
    }
  }
}
