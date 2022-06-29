// To prevent name collision since we have Notifications instance and expo also has notifications
import { Platform } from 'react-native'

import PushNotificationIOS from '@react-native-community/push-notification-ios'

// FeedDB Helper Function
const AppBadgeHelper = {
  // To Get App Badge Count
  getAppBadgeCount: async () => {
    return await PushNotificationIOS.getApplicationIconBadgeNumber()
  },
  // To Set App Badge Count
  setAppBadgeCount: async (badgeNumber) => {
    if (Platform.OS === 'ios') {
      await PushNotificationIOS.setApplicationIconBadgeNumber(badgeNumber)
    }
  },
}

export default AppBadgeHelper
