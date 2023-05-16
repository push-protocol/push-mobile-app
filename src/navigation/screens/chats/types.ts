export interface SingleChatItemProps {
  image: any;
  wallet: string;
  text: string | null;
  count?: number;
  combinedDID: string;
  isIntentReceivePage: boolean;
  isIntentSendPage: boolean;
  clearSearch: () => void;
  chatId?: string;
}
