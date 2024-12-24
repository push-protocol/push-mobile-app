import {
  AndroidMessagingStyleMessage,
  AndroidStyle,
  DisplayedNotification,
} from '@notifee/react-native';
import {Platform} from 'react-native';
import Globals from 'src/Globals';
import {
  NOTIFICATION_SUB_TYPES,
  NOTIFICATION_TYPES,
} from 'src/contexts/NotificationContext';
import {UserChatCredentials} from 'src/navigation/screens/chats/ChatScreen';
import MetaStorage from 'src/singletons/MetaStorage';

import {caip10ToWallet} from './CAIPHelper';
import {GroupInformation, NotificationHelperType} from './helpers.types';

export const NotificationHelper: NotificationHelperType = {
  getNotifeeConfig: async (
    type,
    remoteMessage,
    getRecentMessageNotifications,
  ) => {
    const parsedDetails = JSON.parse(
      (remoteMessage.data?.details as string) || '{}',
    );
    if (type === NOTIFICATION_TYPES.CHANNEL) {
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
    } else if (type === NOTIFICATION_TYPES.CHAT) {
      let recentChatNotifications: DisplayedNotification[] = [];
      let messages: AndroidMessagingStyleMessage[] = [];
      let lines: string[] = [];
      if (Platform.OS === 'android') {
        recentChatNotifications = await getRecentMessageNotifications(
          parsedDetails?.info?.chatId,
        );

        if (parsedDetails?.subType === NOTIFICATION_SUB_TYPES.INDIVIDUAL_CHAT) {
          messages =
            recentChatNotifications.length > 0
              ? recentChatNotifications?.[0]?.notification?.android?.style
                  ?.messages
              : [];

          messages.push({
            text: remoteMessage.notification?.body ?? '',
            timestamp: remoteMessage.sentTime ?? Date.now(),
          });
        } else if (
          parsedDetails?.subType === NOTIFICATION_SUB_TYPES.GROUP_CHAT
        ) {
          lines =
            recentChatNotifications.length > 0
              ? recentChatNotifications?.[0]?.notification?.android?.style
                  ?.lines
              : [];

          lines.push(remoteMessage.notification?.body ?? '');
        }
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
            conversationId:
              parsedDetails?.info?.chatId ?? remoteMessage.messageId,
            sender: {
              id: parsedDetails?.info?.wallets ?? remoteMessage.messageId,
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
          style:
            parsedDetails?.subType === NOTIFICATION_SUB_TYPES.GROUP_CHAT
              ? {type: AndroidStyle.INBOX, lines}
              : {
                  type: AndroidStyle.MESSAGING,
                  person: {
                    name: remoteMessage.notification?.title ?? '',
                    icon:
                      parsedDetails?.info?.profilePicture &&
                      parsedDetails?.info?.profilePicture?.length > 0
                        ? parsedDetails?.info?.profilePicture
                        : 'default',
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
          groupInformation = {
            groupName: groupInformationResponse?.groupName,
            groupImage: groupInformationResponse?.groupImage,
          };
        }

        // Get latest message to check if conversation request accepted or not
        let isIntentReceivePage = false;
        const conversationHashResponse: any =
          await userPushSDKInstance?.chat.latest(chatId);
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
          senderAddress: isGroupConversation ? null : caip10ToWallet(wallets),
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
