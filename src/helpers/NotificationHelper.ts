import notifee, {
  AndroidMessagingStyleMessage,
  AndroidStyle,
  EventType,
} from '@notifee/react-native';
import * as PushApi from '@pushprotocol/restapi';
import {ENV} from '@pushprotocol/restapi/src/lib/constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import messaging from '@react-native-firebase/messaging';
import {FirebaseMessagingTypes} from '@react-native-firebase/messaging';
import GLOBALS from 'src/Globals';
import envConfig from 'src/env.config';
import {getCurrentRouteName, navigate} from 'src/navigation/RootNavigation';
import {UserChatCredentials} from 'src/navigation/screens/chats/ChatScreen';
import {globalDispatch} from 'src/redux';
import {setNotificationAlert} from 'src/redux/appSlice';
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
      NotificationHelper.handlePostNotificationReceived(
        NOTIFICATION_TYPES.CHANNEL,
      );
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

  /************************************************/
  /**   Handle native notification and notifee   **/
  /**        events(onPress and dismiss)         **/
  /************************************************/
  handleNotificationEvents: async () => {
    console.log('Execute Notification events');
    messaging()
      .getInitialNotification()
      .then(async remoteMessage => {
        if (remoteMessage) {
          console.log(
            'Remote Notification caused app to open from quit state:',
            remoteMessage,
          );
          await NotificationHelper.handleNotificationRoute(
            remoteMessage.data?.type as string,
          );
        }
      });

    messaging().onNotificationOpenedApp(async remoteMessage => {
      console.log(
        'Remote Notification caused app to open from background state:',
        remoteMessage,
      );
      await NotificationHelper.handleNotificationRoute(
        remoteMessage.data?.type as string,
      );
    });

    notifee.onForegroundEvent(async ({type, detail}) => {
      console.log('notifee.onForegroundEvent', {type, detail});
      if (type === EventType.PRESS) {
        await NotificationHelper.handleNotificationRoute(
          detail.notification?.data?.type as string,
        );
      }
    });

    notifee.onBackgroundEvent(async ({type, detail}) => {
      console.log('Notifee caused application to open from background state', {
        type,
        detail,
      });
      if (type === EventType.PRESS) {
        await NotificationHelper.handleNotificationRoute(
          detail.notification?.data?.type as string,
        );
      }
    });

    const initialNotification = await notifee.getInitialNotification();
    if (initialNotification) {
      console.log(
        'Notifee caused application to open from quit state',
        initialNotification,
      );
      const {notification} = initialNotification;
      await NotificationHelper.handleNotificationRoute(
        notification?.data?.type as string,
      );
    }
  },

  /************************************************/
  /**    Handle notification routes and data     **/
  /************************************************/
  handleNotificationRoute: async (type: string, data?: any) => {
    navigate(GLOBALS.SCREENS.NOTIF_TABS, {activeTab: 'inbox'});
    // if (
    //   type === NOTIFICATION_TYPES.CHANNEL &&
    //   getCurrentRouteName() !== GLOBALS.SCREENS.NOTIF_TABS
    // ) {
    //   navigate(GLOBALS.SCREENS.NOTIF_TABS);
    // } else if (type === NOTIFICATION_TYPES.CHAT) {
    // }
  },

  /*****************************************************/
  /**   Handle data updates in the Foreground state   **/
  /**       if the received notification is for       **/
  /**      the currently active component screen.     **/
  /*****************************************************/
  handlePostNotificationReceived: (type: string, data?: any) => {
    if (
      type === NOTIFICATION_TYPES.CHANNEL &&
      getCurrentRouteName() == GLOBALS.SCREENS.NOTIF_TABS
    ) {
      globalDispatch(
        setNotificationAlert({
          screen: GLOBALS.SCREENS.NOTIF_TABS,
          type: 'inbox',
        }),
      );
    }
  },
};
