import messaging from '@react-native-firebase/messaging';
import MetaStorage from 'src/singletons/MetaStorage';

// STATIC SINGLETON
export default class Notify {
  static instance = Notify.instance || new Notify();

  // VARIBALES
  state = {
    notificationListenerCB: null,
  };

  // INITIALIZE
  initialize = async () => {
    // For Initialization of anything, not needed right now
  };

  // Request Device Token
  requestDeviceToken = async onlySignedIn => {
    if (onlySignedIn) {
      const signedin = await MetaStorage.instance.getIsSignedIn();

      if (!signedin) {
        return;
      }
    }

    // FIREBASE
    const status = await messaging().hasPermission();
    console.log(status);
    if (status === messaging.AuthorizationStatus.AUTHORIZED) {
      messaging()
        .getToken()
        .then(token => {
          console.log(token);
          this.saveDeviceToken(token);
        });
    }
  };

  // Save Device Token
  saveDeviceToken = async (token, isRefreshToken) => {
    // For Test sending
    console.log(
      'Token Receive:' + token + '  |---| is Refresh Token: ' + isRefreshToken,
    );

    // Get previous token
    const previousToken = await MetaStorage.instance.getPushToken();

    if (previousToken !== token || isRefreshToken) {
      if (isRefreshToken) {
        // Set the previous token
        await MetaStorage.instance.setPushTokenToRemove(previousToken);
      }

      // This is a new token, save it
      await MetaStorage.instance.setPushToken(token);

      // Also flag for server
      await MetaStorage.instance.setTokenServerSynced(false);
    }
  };

  // Handle incoming notification Foreground
  handleIncomingPushAppOpened = async remoteMessage => {
    //console.log("Notification Handled From Foreground!");
    await this.handleIncomingPush(remoteMessage);

    // Listen for callbacks, etc as well
    if (this.state.notificationListenerCB) {
      this.state.notificationListenerCB();
    }
  };

  // Handle incoming notification Background
  handleIncomingPushAppInBG = async remoteMessage => {
    //console.log("Notification Handled From Background!");
    await this.handleIncomingPush(remoteMessage);
  };

  // To subscribe to notification recieved
  setNotificationListenerCallback = callback => {
    this.state.notificationListenerCB = callback;
  };

  // Trigger Notication Listener Callback
  triggerNotificationListenerCallback = () => {
    if (this.state.notificationListenerCB) {
      // Callback
      this.state.notificationListenerCB();
    }
  };
}
