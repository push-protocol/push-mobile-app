import notifee, {
  AndroidMessagingStyleMessage,
  AndroidStyle,
  EventType,
} from '@notifee/react-native';
import * as PushApi from '@pushprotocol/restapi';
import {ENV} from '@pushprotocol/restapi/src/lib/constants';
import messaging from '@react-native-firebase/messaging';
import {FirebaseMessagingTypes} from '@react-native-firebase/messaging';
import Globals from 'src/Globals';
import GLOBALS from 'src/Globals';
import envConfig from 'src/env.config';
import {getCurrentRouteName, navigate} from 'src/navigation/RootNavigation';
import {UserChatCredentials} from 'src/navigation/screens/chats/ChatScreen';
import {globalDispatch} from 'src/redux';
import {updateInboxNotificationAcknowledgement} from 'src/redux/homeSlice';
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

const NOTIFICATION_SUB_TYPES = {
  INBOX: 'INBOX',
};

export const NotificationHelper = {
  resolveNotification: async (
    remoteMessage: FirebaseMessagingTypes.RemoteMessage,
  ) => {
    if (remoteMessage?.data?.type === NOTIFICATION_TYPES.CHAT) {
      NotificationHelper.handleChatNotification(remoteMessage);
    } else if (remoteMessage?.data?.type === NOTIFICATION_TYPES.CHANNEL) {
      NotificationHelper.handleChannelNotification(remoteMessage);
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

  /**************************************************/
  /** This Function will push CHANNEL notification **/
  /**************************************************/
  handleChannelNotification: async (
    remoteMessage: FirebaseMessagingTypes.RemoteMessage,
  ) => {
    try {
      const parsedDetails = remoteMessage.data?.details
        ? JSON.parse(remoteMessage.data?.details as string)
        : {};
      const largeIcon = parsedDetails?.info?.icon ?? 'ic_launcher_round';
      await notifee.displayNotification({
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
      });
      NotificationHelper.handlePostNotificationReceived(remoteMessage.data);
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

  getRecentMessageNotifications: async (from: string): Promise<any[]> => {
    try {
      const getDisplayedNotifications =
        await notifee.getDisplayedNotifications();
      return getDisplayedNotifications;
    } catch (error) {
      return [];
    }
  },

  /************************************************/
  /**   Handle native notification and notifee   **/
  /**        events(onPress and dismiss)         **/
  /************************************************/
  handleNotificationEvents: async () => {
    messaging()
      .getInitialNotification()
      .then(async remoteMessage => {
        if (remoteMessage) {
          await NotificationHelper.handleNotificationRoute(remoteMessage.data);
        }
      });

    messaging().onNotificationOpenedApp(async remoteMessage => {
      await NotificationHelper.handleNotificationRoute(remoteMessage.data);
    });

    notifee.onForegroundEvent(async ({type, detail}) => {
      if (type === EventType.PRESS) {
        await NotificationHelper.handleNotificationRoute(
          detail.notification?.data,
        );
      }
    });

    notifee.onBackgroundEvent(async ({type, detail}) => {
      if (type === EventType.PRESS) {
        await NotificationHelper.handleNotificationRoute(
          detail.notification?.data,
        );
      }
    });

    const initialNotification = await notifee.getInitialNotification();
    if (initialNotification) {
      const {notification} = initialNotification;
      await NotificationHelper.handleNotificationRoute(notification?.data);
    }
  },

  /************************************************/
  /**    Handle notification routes and data     **/
  /************************************************/
  handleNotificationRoute: async (data?: {
    [key: string]: string | number | object;
  }) => {
    // Parse the stringified data
    const parsedDetails = data?.details
      ? JSON.parse(data?.details as string)
      : {};

    // Handle conditional checks to confirm if route navigation &
    //    data needs to be updated after notification opened
    if (
      data?.type === NOTIFICATION_TYPES.CHANNEL &&
      parsedDetails?.subType === NOTIFICATION_SUB_TYPES.INBOX
    ) {
      // If Home(Notification) tab is active then update data
      if (getCurrentRouteName() == GLOBALS.SCREENS.NOTIF_TABS) {
        globalDispatch(
          updateInboxNotificationAcknowledgement({
            notificationOpened: true,
          }),
        );
      } else {
        // If Home(Notification) tab is inactive then first
        //     navigate to Home tab then update data
        navigate(GLOBALS.SCREENS.NOTIF_TABS);
        globalDispatch(
          updateInboxNotificationAcknowledgement({
            notificationOpened: true,
          }),
        );
      }
    } else if (data?.type === NOTIFICATION_TYPES.CHAT) {
    }
  },

  /*****************************************************/
  /**   Handle data updates in the Foreground state   **/
  /**       if the received notification is for       **/
  /**      the currently active component screen.     **/
  /*****************************************************/
  handlePostNotificationReceived: (data?: {
    [key: string]: string | number | object;
  }) => {
    // Parse the stringified data
    const parsedDetails = data?.details
      ? JSON.parse(data?.details as string)
      : {};

    // Handle condition check please data needs to be
    //      updated after notification received
    if (
      data?.type === NOTIFICATION_TYPES.CHANNEL &&
      parsedDetails?.subType === NOTIFICATION_SUB_TYPES.INBOX &&
      getCurrentRouteName() == GLOBALS.SCREENS.NOTIF_TABS
    ) {
      globalDispatch(
        updateInboxNotificationAcknowledgement({
          notificationReceived: true,
        }),
      );
    }
  },
};
