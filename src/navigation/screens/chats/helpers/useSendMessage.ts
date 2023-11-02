import {ENV, send} from '@kalashshah/react-native-sdk/src';
import {ChatSendOptionsType} from '@pushprotocol/restapi';
import {useEffect, useRef, useState} from 'react';
import {ConnectedUser} from 'src/apis';
import * as PushNodeClient from 'src/apis';
import envConfig from 'src/env.config';
import {caip10ToWallet, getCAIPAddress} from 'src/helpers/CAIPHelper';

import {ChatMessage} from './chatResolver';

export interface MessageFormat {
  message: string;
  messageType: 'GIF' | 'Text';
}

type sendIntentFunc = (message: MessageFormat) => Promise<void>;
type sendMessageFunc = (
  message: MessageFormat,
) => Promise<[string, ChatMessage]>;

type useSendMessageReturnType = [
  boolean,
  sendMessageFunc | sendIntentFunc,
  boolean,
  ChatMessage,
];

const generateNullRespose = (): [string, ChatMessage] => {
  return [
    '',
    {to: '', from: '', messageType: '', message: '', time: Date.now()},
  ];
};

const generateNullChatMessage = (): ChatMessage => {
  return {
    from: '',
    message: '',
    messageType: '',
    time: Date.now(),
    to: '',
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
  const [tempChatMessage, setTempChatMessage] = useState<ChatMessage>(
    generateNullChatMessage(),
  );

  const messageReceiver = useRef<PushNodeClient.MessageReciver>({
    ethAddress: getCAIPAddress(receiverAddress),
    pgpAddress: '',
  });

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
  }: MessageFormat): Promise<[string, ChatMessage]> => {
    try {
      setIsSending(true);
      setTempChatMessage({
        to: caip10ToWallet(messageReceiver.current.ethAddress),
        from: caip10ToWallet(connectedUser.wallets),
        messageType: messageType,
        message: message,
        time: Date.now(),
      });

      const payload: ChatSendOptionsType = {
        account: connectedUser.wallets,
        pgpPrivateKey: connectedUser.privateKey,
        message: {
          content: message,
          type: messageType,
        },
        to: receiverAddress,
        env: envConfig.ENV as ENV,
      };

      const res = await send(payload);
      const chatMessage: ChatMessage = {
        to: caip10ToWallet(res.toCAIP10),
        from: caip10ToWallet(res.fromCAIP10),
        messageType: res.messageType,
        message: message,
        time: res.timestamp || Date.now(),
      };

      return [res.cid, chatMessage];
    } catch (e) {
      showToast('error', 'Message was not sent');
      console.log('got err', e);
    } finally {
      setIsSending(false);
    }

    return generateNullRespose();
  };

  return [isSending, sendMessage, isSendingReady, tempChatMessage];
};

export {useSendMessage};
