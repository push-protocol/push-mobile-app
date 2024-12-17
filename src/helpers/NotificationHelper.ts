import {
  AndroidMessagingStyleMessage,
  AndroidStyle,
  DisplayedNotification,
} from '@notifee/react-native';
import {Platform} from 'react-native';
import Globals from 'src/Globals';
import {UserChatCredentials} from 'src/navigation/screens/chats/ChatScreen';
import MetaStorage from 'src/singletons/MetaStorage';

import {GroupInformation, NotificationHelperType} from './helpers.types';

export const NotificationHelper: NotificationHelperType = {
  getNotifeeConfig: async (
    type,
    remoteMessage,
    getRecentMessageNotifications,
  ) => {
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
    } else if (type === 'PUSH_NOTIFICATION_CHAT') {
      let recentChatNotifications: DisplayedNotification[] = [];
      let messages: AndroidMessagingStyleMessage[] = [];
      if (Platform.OS === 'android') {
        recentChatNotifications = await getRecentMessageNotifications(
          parsedDetails?.info?.chatId,
        );

        messages =
          recentChatNotifications.length > 0
            ? recentChatNotifications?.[0]?.notification?.android?.style
                ?.messages
            : [];

        messages.push({
          text: remoteMessage.notification?.body ?? '',
          timestamp: remoteMessage.sentTime ?? Date.now(),
        });
      }
      return {
        id:
          Platform.OS === 'android'
            ? parsedDetails?.info?.chatId
            : remoteMessage.messageId,
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
          categoryId: 'Communications',
          communicationInfo: {
            conversationId: parsedDetails?.info?.chatId,
            sender: {
              id: parsedDetails?.info?.wallets,
              displayName: remoteMessage.notification?.title ?? '',
            },
          },
        },
        android: {
          channelId: 'default',
          smallIcon:
            remoteMessage.notification?.android?.smallIcon ?? 'ic_notification',
          color:
            remoteMessage.notification?.android?.color ??
            Globals.COLORS.IC_NOTIFICATION,
          pressAction: {
            id: 'default',
          },
          style: {
            type: AndroidStyle.MESSAGING,
            person: {
              name: remoteMessage.notification?.title ?? '',
              icon:
                parsedDetails?.subType === 'GROUP_CHAT'
                  ? 'ic_launcher_round'
                  : parsedDetails?.info?.profilePicture,
            },
            messages,
          },
        },
        data: remoteMessage.data,
      };
    }
    return {};
  },

  getChatNavigationParams: async data => {
    const {
      userPushSDKInstance,
      chatId,
      isGroupConversation,
      wallets,
      profilePicture,
      threadhash,
    } = data;
    try {
      if (userPushSDKInstance) {
        // Make connectUser Obj
        const {pgpPrivateKey}: UserChatCredentials =
          await MetaStorage.instance.getUserChatData();
        const users = await MetaStorage.instance.getStoredWallets();
        const connectedUser = users[0];

        // Get Group Data
        let groupInformation: GroupInformation = null;
        if (isGroupConversation) {
          const groupInformationResponse =
            await userPushSDKInstance?.chat.group.info(chatId);
          console.log(
            'groupInformationResponse',
            JSON.stringify(groupInformationResponse),
          );
          groupInformation = {
            groupName: groupInformationResponse?.groupName,
            groupImage: groupInformationResponse?.groupImage,
          };
        }

        // Get latest message to check if conversation request accepted or not
        let isIntentReceivePage = false;
        const conversationHashResponse: any =
          await userPushSDKInstance?.chat.latest(chatId);
        console.log(
          'conversationHashResponse',
          JSON.stringify(conversationHashResponse),
        );
        if (conversationHashResponse?.length > 0) {
          isIntentReceivePage =
            conversationHashResponse?.[0]?.listType !== 'CHATS';
        }
        return {
          feed: {groupInformation},
          isIntentSendPage: false,
          isIntentReceivePage,
          connectedUser: {
            ...connectedUser,
            wallets: connectedUser.wallet,
            privateKey: pgpPrivateKey,
          },
          senderAddress: wallets,
          image: isGroupConversation
            ? groupInformation?.groupImage
            : profilePicture,
          cid: threadhash,
          title: isGroupConversation ? groupInformation?.groupName : null,
          chatId,
        };
      }
      return null;
    } catch (error) {
      return null;
    }
  },
};
