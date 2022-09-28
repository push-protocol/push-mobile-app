import {useState} from 'react';
import {ConnectedUser} from 'src/apis';

type sendMessageFunc = (message: string) => Promise<void>;
type useSendMessageReturnType = [boolean, sendMessageFunc];

const useSendMessage = (
  connectedUser: ConnectedUser,
  receiver: string,
): useSendMessageReturnType => {
  const [isSending, setIsSending] = useState(false);
  const sendMessage = async (message: string) => {
    setIsSending(true);
    console.log('****send message');
    console.log('from', connectedUser.wallets);
    console.log('to', receiver);
    console.log(message, '*****');
    setIsSending(false);
  };

  return [isSending, sendMessage];
};

export {useSendMessage};
