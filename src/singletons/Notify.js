import messaging from '@react-native-firebase/messaging'

import FeedDBHelper from 'src/helpers/FeedDBHelper'
import MetaStorage from 'src/singletons/MetaStorage'

// STATIC SINGLETON
export default class Notify {
  static instance = Notify.instance || new Notify()

  // VARIBALES
  state = {
    notificationListenerCB: null,
  }

  // INITIALIZE
  initialize = async () => {
    // For Initialization of anything, not needed right now
  }

  // Request Device Token
  requestDeviceToken = async (onlySignedIn) => {
    if (onlySignedIn) {
      const signedin = await MetaStorage.instance.getIsSignedIn()

      if (!signedin) {
        return
      }
    }

    const status = await messaging().hasPermission()
    if (status == messaging.AuthorizationStatus.AUTHORIZED) {
      messaging()
        .getToken()
        .then((token) => {
          this.saveDeviceToken(token)
        })
    }
  }

  // Save Device Token
  saveDeviceToken = async (token, isRefreshToken) => {
    // For Test sending
    console.log(
      'Token Recieved:' + token + '  |---| is Refresh Token: ' + isRefreshToken,
    )

    // Get previous token
    const previousToken = await MetaStorage.instance.getPushToken()

    if (previousToken !== token || isRefreshToken) {
      if (isRefreshToken) {
        // Set the previous token
        await MetaStorage.instance.setPushTokenToRemove(previousToken)
      }

      // This is a new token, save it
      await MetaStorage.instance.setPushToken(token)

      // Also flag for server
      await MetaStorage.instance.setTokenServerSynced(false)
    }
  }

  // Handle incoming notification Foreground
  handleIncomingPushAppOpened = async (remoteMessage) => {
    //console.log("Notification Handled From Foreground!");
    await this.handleIncomingPush(remoteMessage)

    // Listen for callbacks, etc as well
    if (this.state.notificationListenerCB) {
      this.state.notificationListenerCB()
    }
  }

  // Handle incoming notification Background
  handleIncomingPushAppInBG = async (remoteMessage) => {
    //console.log("Notification Handled From Background!");
    await this.handleIncomingPush(remoteMessage)
  }

  // Default behavior for any incoming notification
  handleIncomingPush = async (remoteMessage) => {
    // Check if the payload has data
    const payload = remoteMessage['data']
    const db = await FeedDBHelper.getDB()

    if (payload['type']) {
      // Assume message exists and proceed
      await FeedDBHelper.addFeedFromPayload(
        db,
        payload['sid'],
        payload['type'],
        payload['app'],
        payload['icon'],
        payload['url'],
        null,
        payload['secret'],
        payload['asub'],
        payload['amsg'],
        payload['acta'],
        payload['aimg'],
        '0',
        payload['epoch'],
      )
    }

    // console.log("Notification Handled!");
    // console.log(remoteMessage);

    // Trigger Notification Callback
    this.triggerNotificationListenerCallback()
  }

  // To subscribe to notification recieved
  setNotificationListenerCallback = (callback) => {
    this.state.notificationListenerCB = callback
  }

  // Trigger Notication Listener Callback
  triggerNotificationListenerCallback = () => {
    if (this.state.notificationListenerCB) {
      // Callback
      this.state.notificationListenerCB()
    }
  }
}
