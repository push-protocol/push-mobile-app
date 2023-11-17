import * as PushSdk from '@kalashshah/react-native-sdk/src';

export interface SingleChatItemProps {
  image: any;
  wallet: string;
  text: string | null;
  feed?: PushSdk.PushApi.IFeeds;
  count?: number;
  combinedDID: string;
  isIntentReceivePage: boolean;
  isIntentSendPage: boolean;
  clearSearch: () => void;
  chatId?: string;
}
