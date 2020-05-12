// To prevent name collision since we have Notifications instance and expo also has notifications
import {
  Platform
} from 'react-native';
import { Notifications } from 'expo';

import GLOBALS from 'src/Globals';

// FeedDB Helper Function
const AppBadgeHelper = {
  // To Get App Badge Count
  getAppBadgeCount: async () => {
    return await Notifications.getBadgeNumberAsync();
  },
  // To Set App Badge Count
  setAppBadgeCount: async (badgeNumber) => {
    if (Platform.OS ===  "ios") {
      await Notifications.setBadgeNumberAsync(badgeNumber);
    }
  },
}

export default AppBadgeHelper;
