import {IFeeds} from '@pushprotocol/restapi';

export interface SingleChatItemProps {
  image: any;
  wallet?: string;
  title?: string;
  text: string | null;
  feed?: IFeeds;
  count?: number;
  combinedDID: string;
  isIntentReceivePage: boolean;
  isIntentSendPage: boolean;
  clearSearch: () => void;
  chatId?: string;
}
