// To prevent name collision since we have Notifications instance and expo also has notifications
import {
  Platform
} from 'react-native';

import PushNotificationIOS from "@react-native-community/push-notification-ios";

import GLOBALS from 'src/Globals';

// FeedDB Helper Function
const AppBadgeHelper = {
  // To Get App Badge Count
  getAppBadgeCount: async () => {
      return await PushNotificationIOS.getApplicationIconBadgeNumber();
  },
  // To Set App Badge Count
  setAppBadgeCount: async (badgeNumber) => {
    if (Platform.OS ===  "ios") {
      await PushNotificationIOS.setApplicationIconBadgeNumber(badgeNumber);
    }
  },
  registerForPushNotificationsAsync: async () => {
    // if (Constants.isDevice) {
    //   const { status: existingStatus } = await Permissions.getAsync(Permissions.NOTIFICATIONS);
    //   let finalStatus = existingStatus;
    //   if (existingStatus !== 'granted') {
    //     const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
    //     finalStatus = status;
    //   }
    //   if (finalStatus !== 'granted') {
    //     alert('Failed to get push token for push notification!');
    //     return;
    //   }
    //   token = await Notifications.getExpoPushTokenAsync();
    //   console.log(token);
    //   this.setState({ expoPushToken: token });
    // } else {
    //   alert('Must use physical device for Push Notifications');
    // }
    //
    // if (Platform.OS === 'android') {
    //   Notifications.createChannelAndroidAsync('default', {
    //     name: 'default',
    //     sound: true,
    //     priority: 'max',
    //     vibrate: [0, 250, 250, 250],
    //   });
    // }
  }
}

export default AppBadgeHelper;
