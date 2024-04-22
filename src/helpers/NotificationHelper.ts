import notifee, {
  AndroidMessagingStyleMessage,
  AndroidStyle,
} from '@notifee/react-native';
import * as PushApi from '@pushprotocol/restapi';
import {ENV} from '@pushprotocol/restapi/src/lib/constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {FirebaseMessagingTypes} from '@react-native-firebase/messaging';
import {Platform} from 'react-native';
import GLOBALS from 'src/Globals';
import envConfig from 'src/env.config';
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

export const NotificationHelper = {
  resolveNotification: async (
    notification: FirebaseMessagingTypes.RemoteMessage,
  ) => {
    if (notification?.data?.type === 'CHAT') {
      NotificationHelper.handleChatNotification(notification);
    } else if (notification?.data?.type === 'CHANNEL') {
      NotificationHelper.handleChannelNotification(notification);
    }
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

  handleChannelNotification: async (
    message: FirebaseMessagingTypes.RemoteMessage,
  ) => {
    // await NotificationHelper.sendNotification({});
  },

  sendNotification: async (notification: SendNotifeeNotification) => {
    try {
      // await notifee.displayNotification({
      //   id: 'Communications',
      //   title: 'Push protocol notif',
      //   body: 'Hi there this is a test notification from push protocol',
      //   ios: {
      //     categoryId: 'Communications',
      //     communicationInfo: {
      //       conversationId: '123',
      //       sender: {
      //         id: 'abcde',
      //         avatar: 'https://picsum.photos/200',
      //         displayName: 'Aave Channel',
      //       },
      //     },
      //   },
      //   android: {
      //     channelId: 'default',
      //     largeIcon: 'https://picsum.photos/200',
      //     smallIcon: 'ic_launcher',
      //     color: '#9c27b0',
      //     circularLargeIcon: true,
      //     style: {
      //       type: AndroidStyle.MESSAGING,
      //       person: {
      //         name: 'John Doe',
      //         icon: 'https://picsum.photos/200',
      //       },
      //       messages: [
      //         {
      //           text: 'Hey, how are you?',
      //           timestamp: Date.now() - 600000,
      //         },
      //       ],
      //     },
      //   },
      // });
      const messages =
        (await NotificationHelper.getRecentMessageNotifications(
          notification.from.id,
        )) ?? [];
      messages.push(notification.newMessage);

      if (Platform.OS === 'android') {
        await notifee.createChannel({
          id: 'default',
          name: 'Default Channel',
        });
      }

      await notifee.displayNotification({
        id: notification.messageId,
        title: notification?.title,
        body: notification?.body,
        ios: {
          categoryId: 'Communications',
          communicationInfo: {
            conversationId: notification?.conversationId,
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
      console.log('error', error);
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
};
