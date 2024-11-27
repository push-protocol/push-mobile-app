import notifee, {
  AndroidMessagingStyleMessage,
  AndroidStyle,
} from '@notifee/react-native';
import * as PushApi from '@pushprotocol/restapi';
import {ENV} from '@pushprotocol/restapi/src/lib/constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {FirebaseMessagingTypes} from '@react-native-firebase/messaging';
import {Linking} from 'react-native';
import GLOBALS from 'src/Globals';
import envConfig from 'src/env.config';
import {getCurrentRouteName, navigate} from 'src/navigation/RootNavigation';
import {UserChatCredentials} from 'src/navigation/screens/chats/ChatScreen';
import MetaStorage from 'src/singletons/MetaStorage';

type SendNotifeeNotification = {
  messageId: string;
  title?: string;
  body?: string;
  conversationId: string;
  from: {
    id: string;
    avatar: string;
    name: string;
  };
  newMessage: AndroidMessagingStyleMessage;
};

const NOTIFICATION_TYPES = {
  CHANNEL: 'PUSH_NOTIFICATION_CHANNEL',
  CHAT: 'PUSH_NOTIFICATION_CHAT',
};

export const NotificationHelper = {
  resolveNotification: async (
    remoteMessage: FirebaseMessagingTypes.RemoteMessage,
  ) => {
    // if (notification?.data?.type === NOTIFICATION_TYPES.CHAT) {
    //   NotificationHelper.handleChatNotification(notification);
    // } else if (notification?.data?.type === NOTIFICATION_TYPES.CHANNEL) {
    NotificationHelper.handleChannelNotification(remoteMessage);
    // }
  },

  handleChatNotification: async (
    message: FirebaseMessagingTypes.RemoteMessage,
  ) => {
    const {pgpPrivateKey}: UserChatCredentials =
      await MetaStorage.instance.getUserChatData();

    const users = await MetaStorage.instance.getStoredWallets();
    const connectedUser = users[0];

    const [mssg] = await PushApi.chat.decryptConversation({
      messages: [message.data?.message as any],
      env: envConfig.ENV as ENV,
      pgpPrivateKey: pgpPrivateKey,
      connectedUser: {
        ...connectedUser,
        wallets: connectedUser.wallet,
      },
    });

    // await NotificationHelper.sendNotification({
    //   newMessage: {
    //     text: mssg.messageContent,
    //     timestamp: mssg.timestamp ?? Date.now(),
    //     person: {
    //       name: mssg.fromCAIP10,
    //       icon: 'https://picsum.photos/200',
    //     },
    //   },
    // });
  },

  /**************************************************/
  /** This Function will push CHANNEL notification **/
  /**************************************************/
  handleChannelNotification: async (
    remoteMessage: FirebaseMessagingTypes.RemoteMessage,
  ) => {
    try {
      await notifee.displayNotification({
        id: remoteMessage.messageId,
        title: remoteMessage.notification?.title,
        body: remoteMessage.notification?.body,
        ios: {
          sound: 'default',
          foregroundPresentationOptions: {
            alert: true,
            badge: true,
            sound: true,
          },
        },
        android: {
          channelId: 'default',
          largeIcon: remoteMessage.notification?.android?.imageUrl,
          smallIcon:
            remoteMessage.notification?.android?.smallIcon ?? 'ic_notification',
          color: remoteMessage.notification?.android?.color ?? '#e20880',
          circularLargeIcon: true,
          pressAction: {
            id: 'default',
          },
        },
        data: {
          type: NOTIFICATION_TYPES.CHANNEL,
          ...remoteMessage.data,
        },
      });
    } catch (error) {
      console.log('NOTIFEE ERROR', error);
    }
  },

  /***************************************************/
  /**   This Function will push CHAT notification   **/
  /***************************************************/
  sendNotification: async (notification: SendNotifeeNotification) => {
    try {
      const messages = [notification.newMessage];

      await notifee.displayNotification({
        id: notification.messageId,
        title: notification?.title,
        body: notification?.body,
        ios: {
          sound: 'default',
          foregroundPresentationOptions: {
            alert: true,
            badge: true,
            sound: true,
          },
          categoryId: 'Communications',
          communicationInfo: {
            conversationId: notification.conversationId,
            sender: {
              id: notification.from.id,
              avatar: notification.from.avatar,
              displayName: notification.from.name,
            },
          },
        },
        android: {
          channelId: 'default',
          largeIcon: notification.from.avatar,
          smallIcon: '@drawable/ic_stat_name',
          color: '#e20880',
          circularLargeIcon: true,
          pressAction: {
            id: 'default',
          },
          style: {
            type: AndroidStyle.MESSAGING,
            person: {
              name: notification.from.name,
              icon: notification.from.avatar,
            },
            messages: messages,
          },
        },
      });
    } catch (error) {
      console.log('NOTIFEE ERROR', error);
    }
  },

  getRecentMessageNotifications: async (
    from: string,
  ): Promise<AndroidMessagingStyleMessage[]> => {
    try {
      const data = await AsyncStorage.getItem(
        GLOBALS.STORAGE.NOTIFICATION_MESSAGES,
      );
      if (data) {
        const messageMap = JSON.parse(data);
        return messageMap[from] ?? [];
      }
      return [];
    } catch (error) {
      return [];
    }
  },

  handleNotificationRoute: async (type: string) => {
    if (
      type === NOTIFICATION_TYPES.CHANNEL &&
      getCurrentRouteName() !== GLOBALS.SCREENS.NOTIF_TABS
    ) {
      navigate(GLOBALS.SCREENS.NOTIF_TABS);
    } else if (type === NOTIFICATION_TYPES.CHAT) {
    }
  },
};
