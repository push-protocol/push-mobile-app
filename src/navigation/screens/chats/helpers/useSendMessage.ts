import {IMessageIPFS} from '@pushprotocol/restapi';
import {useEffect, useRef, useState} from 'react';
import {ConnectedUser} from 'src/apis';
import * as PushNodeClient from 'src/apis';
import {usePushApi} from 'src/contexts/PushApiContext';
import {caip10ToWallet, getCAIPAddress} from 'src/helpers/CAIPHelper';

export interface MessageFormat {
  message: string;
  messageType: 'GIF' | 'Text';
}

type sendIntentFunc = (message: MessageFormat) => Promise<void>;
type sendMessageFunc = ({
  message,
  messageType,
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
  receiverAddress: string,
  _isIntentSendPage: boolean,
  showToast: any,
): useSendMessageReturnType => {
  const [isSending, setIsSending] = useState(false);
  const [isIntentSendPage, setIsIntentSendPage] = useState(_isIntentSendPage);
  const [isSendingReady, setIsSendingReady] = useState(false);
  const [tempChatMessage, setTempChatMessage] = useState<IMessageIPFS>(
    generateNullChatMessage(),
  );

  const messageReceiver = useRef({
    ethAddress: getCAIPAddress(receiverAddress),
    pgpAddress: '',
  });

  const {userPushSDKInstance} = usePushApi();

  useEffect(() => {
    // getting receivers infos
    (async () => {
      const res = await PushNodeClient.getUser(
        messageReceiver.current.ethAddress,
      );

      if (res && res !== null) {
        // TODO: support pgpv2
        let pubKey = res.publicKey;
        try {
          pubKey = JSON.parse(pubKey).key;
        } catch {
          console.log('pgpv1 receiver');
        }
        messageReceiver.current.pgpAddress = pubKey;
        console.log('Receiver addrs found');
      } else {
        console.log('Receiver not found');
      }
      setIsSendingReady(true);
    })();
  }, []);

  const sendMessage = async ({
    message,
    messageType,
  }: MessageFormat): Promise<[string, IMessageIPFS]> => {
    try {
      if (!userPushSDKInstance) {
        return generateNullRespose();
      }
      setIsSending(true);
      setTempChatMessage({
        toDID: caip10ToWallet(messageReceiver.current.ethAddress),
        toCAIP10: caip10ToWallet(messageReceiver.current.ethAddress),
        fromDID: caip10ToWallet(connectedUser.wallets),
        fromCAIP10: caip10ToWallet(connectedUser.wallets),
        messageType: messageType,
        messageContent: message,
        timestamp: Date.now(),
        encryptedSecret: '',
        encType: '',
        link: '',
        signature: '',
        sigType: '',
      });

      const res = await userPushSDKInstance.chat.send(receiverAddress, {
        content: message,
        type: messageType,
      });

      const chatMessage: IMessageIPFS = {
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
      };

      return [res.cid, chatMessage];
    } catch (e) {
      showToast('error', 'Message was not sent');
    } finally {
      setIsSending(false);
    }

    return generateNullRespose();
  };

  return [isSending, sendMessage, isSendingReady, tempChatMessage];
};

export {useSendMessage};
