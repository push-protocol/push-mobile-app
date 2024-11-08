import {IMessageIPFS} from '@pushprotocol/restapi';
import {useState} from 'react';
import {ConnectedUser} from 'src/apis';
import {usePushApi} from 'src/contexts/PushApiContext';
import {caip10ToWallet} from 'src/helpers/CAIPHelper';

export interface MessageFormat {
  message: string;
  messageType: 'GIF' | 'Text' | 'MediaEmbed';
  replyRef?: string;
  reactionRef?: string;
}

type sendIntentFunc = (message: MessageFormat) => Promise<void>;
type sendMessageFunc = ({
  message,
  messageType,
  replyRef,
}: MessageFormat) => Promise<[string, IMessageIPFS]>;

type useSendMessageReturnType = [
  boolean,
  sendMessageFunc | sendIntentFunc,
  boolean,
  IMessageIPFS,
];

const generateNullRespose = (): [string, IMessageIPFS] => {
  return ['', generateNullChatMessage()];
};

const generateNullChatMessage = (): IMessageIPFS => {
  return {
    toDID: '',
    toCAIP10: '',
    fromDID: '',
    fromCAIP10: '',
    messageType: '',
    messageContent: '',
    timestamp: 0,
    encryptedSecret: '',
    encType: '',
    link: '',
    signature: '',
    sigType: '',
  };
};

const useSendMessage = (
  connectedUser: ConnectedUser,
  to: string,
  _isIntentSendPage: boolean,
  showToast: any,
): useSendMessageReturnType => {
  const [isSending, setIsSending] = useState(false);
  const [tempChatMessage, setTempChatMessage] = useState<IMessageIPFS>(
    generateNullChatMessage(),
  );

  const {userPushSDKInstance} = usePushApi();

  const sendMessage = async ({
    message,
    messageType,
    replyRef,
    reactionRef,
  }: MessageFormat): Promise<[string, IMessageIPFS]> => {
    try {
      if (!userPushSDKInstance) {
        return generateNullRespose();
      }
      setIsSending(true);

      const messagePayload: any = {
        type: messageType,
        content: message,
      };

      const messageObj: any = {
        content: message,
      };

      if (reactionRef) {
        messagePayload.reference = reactionRef;
        messageObj.reference = reactionRef;
      }

      if (replyRef) {
        messagePayload.type = 'Reply';
        messagePayload.content = {
          type: messageType,
          content: message,
        };
        messagePayload.reference = replyRef;
        messageObj.content = {
          messageType,
          messageObj: {
            content: message,
          },
        };
        messageObj.reference = replyRef;
      }

      const res = await userPushSDKInstance.chat.send(to, messagePayload);
      const chatMessage: IMessageIPFS = {
        // @ts-ignore
        cid: res.cid,
        toDID: caip10ToWallet(res.toCAIP10),
        toCAIP10: caip10ToWallet(res.toCAIP10),
        fromDID: caip10ToWallet(res.fromCAIP10),
        fromCAIP10: caip10ToWallet(res.fromCAIP10),
        messageType: res.messageType,
        messageContent: message,
        timestamp: res.timestamp || Date.now(),
        encryptedSecret: res.encryptedSecret,
        encType: res.encType,
        link: res.cid,
        signature: res.signature,
        sigType: res.sigType,
        verificationProof: res.verificationProof,
        messageObj,
      };

      return [res.cid, chatMessage];
    } catch (e) {
      showToast('Message was not sent', 'bug-outline');
    } finally {
      setIsSending(false);
    }

    return generateNullRespose();
  };

  return [isSending, sendMessage, true, tempChatMessage];
};

export {useSendMessage};
