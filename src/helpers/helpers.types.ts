import {DisplayedNotification, Notification} from '@notifee/react-native';
import {PushAPI} from '@pushprotocol/restapi';
import {FirebaseMessagingTypes} from '@react-native-firebase/messaging';

export type NotificationTypes =
  | 'PUSH_NOTIFICATION_CHANNEL'
  | 'PUSH_NOTIFICATION_CHAT';

export type NotificationHelperType = {
  getNotifeeConfig: (
    type: NotificationTypes,
    remoteMessage: FirebaseMessagingTypes.RemoteMessage,
    getRecentMessageNotifications: (
      chatId?: string,
    ) => Promise<DisplayedNotification[]>,
  ) => Promise<Notification>;
  getChatNavigationParams: (
    data: ChatNavigationParams,
  ) => Promise<ReturnChatNavigationParams | null>;
};

export type GroupInformation = {
  groupName: string;
  groupImage: string | null;
} | null;

export type ChatNavigationParams = {
  chatId: string;
  userPushSDKInstance: PushAPI | null;
  isGroupConversation: boolean;
  wallets: string;
  profilePicture: string;
  threadhash: string;
};

export type ReturnChatNavigationParams = {
  cid: string;
  senderAddress: string | null;
  connectedUser: any;
  isIntentReceivePage: boolean;
  isIntentSendPage: boolean;
  image: string | null | undefined;
  chatId: string;
  feed: {
    groupInformation: GroupInformation;
  };
  title: string | null | undefined;
};
