import {Notification} from '@notifee/react-native';
import {FirebaseMessagingTypes} from '@react-native-firebase/messaging';
import Globals from 'src/Globals';

import {NotificationTypes} from './helpers.types';

export const getNotifeeConfig = (
  type: NotificationTypes,
  remoteMessage: FirebaseMessagingTypes.RemoteMessage,
): Notification => {
  const parsedDetails = remoteMessage.data?.details
    ? JSON.parse(remoteMessage.data?.details as string)
    : {};
  if (type === 'PUSH_NOTIFICATION_CHANNEL') {
    const largeIcon = parsedDetails?.info?.icon ?? 'ic_launcher_round';
    return {
      id: remoteMessage.messageId,
      title: remoteMessage.notification?.title,
      body: remoteMessage.notification?.body,
      ios: {
        sound: 'default',
        foregroundPresentationOptions: {
          banner: true,
          list: true,
          badge: true,
          sound: true,
        },
      },
      android: {
        channelId: 'default',
        largeIcon,
        smallIcon:
          remoteMessage.notification?.android?.smallIcon ?? 'ic_notification',
        color:
          remoteMessage.notification?.android?.color ??
          Globals.COLORS.IC_NOTIFICATION,
        circularLargeIcon: true,
        pressAction: {
          id: 'default',
        },
      },
      data: remoteMessage.data,
    };
  } else {
    return {};
  }
};
