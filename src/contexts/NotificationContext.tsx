import notifee, {
  AndroidImportance,
  DisplayedNotification,
  EventType,
} from '@notifee/react-native';
import messaging, {
  FirebaseMessagingTypes,
} from '@react-native-firebase/messaging';
import React, {createContext, useEffect, useRef, useState} from 'react';
import {Platform} from 'react-native';
import EncryptedStorage from 'react-native-encrypted-storage';
import {useSelector} from 'react-redux';
import GLOBALS from 'src/Globals';
import Globals from 'src/Globals';
import {NotificationHelper} from 'src/helpers/NotificationHelper';
import {usePushApiMode} from 'src/hooks/pushapi/usePushApiMode';
import {
  getCurrentRouteName,
  getCurrentRouteParams,
  navigate,
  replaceRoute,
} from 'src/navigation/RootNavigation';
import {selectCurrentUser, selectUsers} from 'src/redux/authSlice';

import {usePushApi} from './PushApiContext';

export const NOTIFICATION_TYPES = {
  CHANNEL: 'PUSH_NOTIFICATION_CHANNEL',
  CHAT: 'PUSH_NOTIFICATION_CHAT',
};

export const NOTIFICATION_SUB_TYPES = {
  INBOX: 'INBOX',
  SPAM: 'SPAM',
  INDIVIDUAL_CHAT: 'INDIVIDUAL_CHAT',
  GROUP_CHAT: 'GROUP_CHAT',
};

type NotificationDataType = {
  [key: string]: string | number | object;
};

type NotificationContextType = {
  handleNotificationEvents: () => void;
  createNotificationChannel: () => void;
  setTempNotificationData: (value: NotificationDataType | null) => void;
  resolveNotification: (
    remoteMessage: FirebaseMessagingTypes.RemoteMessage,
  ) => void;
  channelNotificationReceived: boolean;
  setChannelNotificationReceived: (value: boolean) => void;
  channelNotificationOpened: boolean;
  setChannelNotificationOpened: (value: boolean) => void;
  removeOpenedChatNotifications: (chatId: string) => void;
};

const NotificationContext = createContext<NotificationContextType>({
  handleNotificationEvents: () => {},
  createNotificationChannel: () => {},
  setTempNotificationData: () => {},
  resolveNotification: () => {},
  channelNotificationReceived: false,
  setChannelNotificationReceived: () => {},
  channelNotificationOpened: false,
  setChannelNotificationOpened: () => {},
  removeOpenedChatNotifications: () => {},
});

export const NotificationContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const {isChatEnabled} = usePushApiMode();
  const {showUnlockProfileModal, userPushSDKInstance} = usePushApi();

  const users = useSelector(selectUsers);
  const currentUser = useSelector(selectCurrentUser);

  const wallet = users[currentUser]?.wallet;
  const pkey = users[currentUser]?.userPKey;

  const isChatEnabledRef = useRef<boolean>(isChatEnabled);

  const [tempNotificationData, setTempNotificationData] =
    useState<NotificationDataType | null>(null);
  const [channelNotificationReceived, setChannelNotificationReceived] =
    useState<boolean>(false);
  const [channelNotificationOpened, setChannelNotificationOpened] =
    useState<boolean>(false);

  useEffect(() => {
    isChatEnabledRef.current = isChatEnabled;
    if (isChatEnabled && tempNotificationData) {
      handleNotificationRoute(tempNotificationData, true);
    }
  }, [isChatEnabled]);

  useEffect(() => {
    // Foreground Notifications
    const unsubscribeOnMessage = messaging().onMessage(async remoteMessage => {
      if (remoteMessage.notification) {
        resolveNotification(remoteMessage);
      }
    });

    // Background Notifications
    messaging().setBackgroundMessageHandler(async remoteMessage => {});

    return () => {
      unsubscribeOnMessage();
    };
  }, []);

  /**************************************************/
  /**   This Function will create native android   **/
  /**             notification channel             **/
  /**************************************************/
  const createNotificationChannel = () => {
    if (Platform.OS === 'android') {
      messaging()
        .hasPermission()
        .then(val => {
          if (val === 1) {
            // User has enabled notifications
            notifee.createChannel({
              id: 'default',
              name: 'Default Channel',
              sound: 'default',
              importance: AndroidImportance.HIGH,
            });
          }
        });
    }
  };

  const resolveNotification = async (
    remoteMessage: FirebaseMessagingTypes.RemoteMessage,
  ) => {
    const type = remoteMessage?.data?.type;
    if (type === NOTIFICATION_TYPES.CHAT) {
      handleChatNotification(remoteMessage);
    } else if (type === NOTIFICATION_TYPES.CHANNEL) {
      handleChannelNotification(remoteMessage);
    }
  };

  /**************************************************/
  /** This Function will push CHANNEL notification **/
  /**************************************************/
  const handleChannelNotification = async (
    remoteMessage: FirebaseMessagingTypes.RemoteMessage,
  ) => {
    try {
      const notifeeConfig = await NotificationHelper.getNotifeeConfig(
        'PUSH_NOTIFICATION_CHANNEL',
        remoteMessage,
        getRecentMessageNotifications,
      );
      await notifee.displayNotification(notifeeConfig);
      handlePostNotificationReceived(remoteMessage.data);
    } catch (error) {
      console.log('NOTIFEE CHANNEL ERROR', error);
    }
  };

  /***************************************************/
  /**   This Function will push CHAT notification   **/
  /***************************************************/
  const handleChatNotification = async (
    remoteMessage: FirebaseMessagingTypes.RemoteMessage,
  ) => {
    // Parse the stringified data
    const parsedDetails = JSON.parse(
      (remoteMessage.data?.details as string) || '{}',
    );
    try {
      if (
        getCurrentRouteName() !== GLOBALS.SCREENS.SINGLE_CHAT ||
        (getCurrentRouteName() === GLOBALS.SCREENS.SINGLE_CHAT &&
          getCurrentRouteParams()?.chatId !== parsedDetails?.info?.chatId)
      ) {
        const notifeeConfig = await NotificationHelper.getNotifeeConfig(
          'PUSH_NOTIFICATION_CHAT',
          remoteMessage,
          getRecentMessageNotifications,
        );
        await notifee.displayNotification(notifeeConfig);
      }
    } catch (error) {
      console.log('NOTIFEE CHAT ERROR', error);
    }
  };

  /**********************************************************/
  /**   This Function will return list of notifications    **/
  /**      that are available in notification centre       **/
  /**********************************************************/
  const getRecentMessageNotifications = async (
    chatId?: string,
  ): Promise<DisplayedNotification[]> => {
    try {
      const getDisplayedNotifications =
        await notifee.getDisplayedNotifications();
      if (chatId) {
        const recentNotifications = getDisplayedNotifications.filter(
          item => item.id === chatId,
        );
        return recentNotifications;
      } else {
        return getDisplayedNotifications;
      }
    } catch (error) {
      return [];
    }
  };

  /*****************************************************************************************/
  /**  This function will remove other notification banners from the notification center  **/
  /**               if any notification for the same chat has been opened.                **/
  /*****************************************************************************************/
  const removeOpenedChatNotifications = async (chatId: string) => {
    try {
      const recentNotifications = await getRecentMessageNotifications();
      const recentChatNotificationsIDs = recentNotifications
        .filter(
          item =>
            JSON.parse((item.notification.data?.details as string) ?? '{}')
              ?.info?.chatId === chatId,
        )
        .map(item => `${item.id}`);
      await notifee.cancelDisplayedNotifications(recentChatNotificationsIDs);
    } catch (error) {
      console.log('removeOpenedChatNotifications ERROR', error);
    }
  };

  /************************************************/
  /**   Handle native notification and notifee   **/
  /**        events(onPress and dismiss)         **/
  /************************************************/
  const handleNotificationEvents = async () => {
    messaging()
      .getInitialNotification()
      .then(async remoteMessage => {
        if (remoteMessage) {
          handleNotificationRoute(remoteMessage.data);
        }
      });

    messaging().onNotificationOpenedApp(
      async (remoteMessage: FirebaseMessagingTypes.RemoteMessage) => {
        if (remoteMessage) {
          handleNotificationRoute(remoteMessage.data);
        }
      },
    );

    notifee.onForegroundEvent(async ({type, detail}) => {
      if (type === EventType.PRESS) {
        handleNotificationRoute(detail.notification?.data);
      }
    });

    notifee.onBackgroundEvent(async ({type, detail}) => {
      if (type === EventType.PRESS) {
        handleNotificationRoute(detail.notification?.data);
      }
    });

    const initialNotification = await notifee.getInitialNotification();
    if (initialNotification) {
      const {notification} = initialNotification;
      handleNotificationRoute(notification?.data);
    }
  };

  /************************************************/
  /**    Handle notification routes and data     **/
  /************************************************/
  const handleNotificationRoute = async (
    data?: NotificationDataType,
    canAccessChat?: boolean,
  ) => {
    // Parse the stringified data
    const parsedDetails = JSON.parse((data?.details as string) || '{}');

    // Handle conditional checks to confirm if route navigation &
    //    data needs to be updated after notification opened
    if (
      data?.type === NOTIFICATION_TYPES.CHANNEL &&
      parsedDetails?.subType === NOTIFICATION_SUB_TYPES.INBOX
    ) {
      // If Home(Notification) tab is active then update data
      if (getCurrentRouteName() == GLOBALS.SCREENS.NOTIF_TABS) {
        setChannelNotificationOpened(true);
      } else {
        // If Home(Notification) tab is inactive then first
        //     navigate to Home tab then update data
        navigate(GLOBALS.SCREENS.NOTIF_TABS, {
          wallet,
        });
        setChannelNotificationOpened(true);
      }
    } else if (data?.type === NOTIFICATION_TYPES.CHAT) {
      // Handle Chat notification banner press
      const resolvedCanAccessChat = canAccessChat ?? isChatEnabledRef.current; // Use ref for default
      if (resolvedCanAccessChat) {
        try {
          if (parsedDetails?.subType) {
            // Get navigation params for SINGLE CHAT Screen
            const isGroupConversation =
              parsedDetails?.subType === NOTIFICATION_SUB_TYPES.GROUP_CHAT;
            const singleChatParams =
              await NotificationHelper.getChatNavigationParams({
                chatId: parsedDetails?.info?.chatId,
                userPushSDKInstance: userPushSDKInstance,
                isGroupConversation,
                wallets: parsedDetails?.info?.wallets,
                profilePicture: parsedDetails?.info?.profilePicture,
                threadhash: parsedDetails?.info?.threadhash,
              });
            if (singleChatParams) {
              if (
                getCurrentRouteName() === GLOBALS.SCREENS.SINGLE_CHAT &&
                getCurrentRouteParams()?.chatId !== parsedDetails?.info?.chatId
              ) {
                // If Single/Group chat screen is already active with different chatId then update params data
                replaceRoute(GLOBALS.SCREENS.SINGLE_CHAT, singleChatParams);
              } else if (
                getCurrentRouteName() !== GLOBALS.SCREENS.SINGLE_CHAT
              ) {
                // Navigate to Single/Group chat screen
                navigate(GLOBALS.SCREENS.SINGLE_CHAT, singleChatParams);
              }
            }
          } else if (
            !parsedDetails?.subType &&
            getCurrentRouteName() !== GLOBALS.SCREENS.CHATS
          ) {
            // Handled rare case for missing notification data: navigates to the chat list instead of a specific chat.
            navigate(GLOBALS.SCREENS.CHATS, {
              wallet,
              pkey,
            });
          }
          setTempNotificationData(null);
        } catch (error) {
          console.log('Notification Route ERROR', error);
        }
      } else {
        showUnlockProfileModal();
        setTempNotificationData(data);
      }
    }
  };

  /*****************************************************/
  /**   Handle data updates in the Foreground state   **/
  /**       if the received notification is for       **/
  /**      the currently active component screen.     **/
  /*****************************************************/
  const handlePostNotificationReceived = (data?: NotificationDataType) => {
    // Parse the stringified data
    const parsedDetails = JSON.parse((data?.details as string) || '{}');

    // Handle condition check please data needs to be
    //      updated after notification received
    if (
      data?.type === NOTIFICATION_TYPES.CHANNEL &&
      parsedDetails?.subType === NOTIFICATION_SUB_TYPES.INBOX &&
      getCurrentRouteName() == GLOBALS.SCREENS.NOTIF_TABS
    ) {
      setChannelNotificationReceived(true);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        handleNotificationEvents,
        createNotificationChannel,
        setTempNotificationData,
        resolveNotification,
        channelNotificationReceived,
        setChannelNotificationReceived,
        channelNotificationOpened,
        setChannelNotificationOpened,
        removeOpenedChatNotifications,
      }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotificationsApi = () => {
  const context = React.useContext(NotificationContext);
  if (!context)
    throw new Error(
      'useNotifications must be used within a NotificationContextProvider',
    );

  return context;
};

export default NotificationContextProvider;
