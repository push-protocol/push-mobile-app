import {useEffect, useRef, useState} from 'react';
import {ConnectedUser} from 'src/apis';
import * as PushNodeClient from 'src/apis';
import {showSimpleToast} from 'src/components/indicators/SimpleToast';
import {caip10ToWallet, getCAIPAddress} from 'src/helpers/CAIPHelper';
import {encryptAndSign} from 'src/helpers/w2w/pgp';

import {ChatMessage, parseTimeStamp} from './chatResolver';

// import {storeConversationData} from './storage';

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
];
type MessageReciver = {ethAddress: string; pgpAddress: string};

const getEncryptedMessage = async (
  connectedUser: ConnectedUser,
  messageReceiver: MessageReciver,
  message: string,
) => {
  const encryptedMessage = await encryptAndSign({
    plainText: message,
    fromPublicKeyArmored: connectedUser.publicKey,
    toPublicKeyArmored: messageReceiver.pgpAddress,
    privateKeyArmored: connectedUser.privateKey,
  });

  return encryptedMessage;
};

const useSendMessage = (
  connectedUser: ConnectedUser,
  receiverAddress: string,
  _isIntentSendPage: boolean,
): useSendMessageReturnType => {
  const [isSending, setIsSending] = useState(false);
  const [isIntentSendPage, setIsIntentSendPage] = useState(_isIntentSendPage);
  const [isSendingReady, setIsSendingReady] = useState(false);
  const messageReceiver = useRef<MessageReciver>({
    ethAddress: getCAIPAddress(receiverAddress),
    pgpAddress: '',
  });

  useEffect(() => {
    // getting receivers infos
    (async () => {
      console.log('Quering the receiver');
      const res = await PushNodeClient.getUser(
        messageReceiver.current.ethAddress,
      );
      if (res) {
        messageReceiver.current.pgpAddress = res.publicKey;
        console.log('Receiver addrs found');
        setIsSendingReady(true);
      } else {
        console.log('Receiver not found');
      }
    })();
  }, []);

  const sendMessage = async ({
    message,
    messageType,
  }: MessageFormat): Promise<[string, ChatMessage]> => {
    console.log('sending was called', isSendingReady);

    setIsSending(true);
    console.log('**** send message');
    const msg = await getEncryptedMessage(
      connectedUser,
      messageReceiver.current,
      message,
    );

    const postBody = {
      fromCAIP10: connectedUser.wallets,
      fromDID: connectedUser.wallets,
      toDID: messageReceiver.current.ethAddress,
      toCAIP10: messageReceiver.current.ethAddress,
      messageContent: msg.cipherText,
      messageType: messageType,
      signature: msg.signature,
      encType: msg.encType,
      sigType: msg.sigType,
      encryptedSecret: msg.encryptedSecret,
    };

    try {
      const res = await PushNodeClient.postMessage(postBody);
      if (typeof res === 'string') {
        throw new Error('Error posing');
      }

      // TODO:fix add to cache
      // add to cache
      // await storeConversationData(messageReceiver.current.ethAddress, res);
      const timeStamp = res.timestamp ? res.timestamp : 0;
      const cid = res.cid;
      const chatMessage: ChatMessage = {
        to: caip10ToWallet(postBody.toCAIP10),
        from: caip10ToWallet(postBody.fromCAIP10),
        messageType: postBody.messageType,
        message: message,
        time: parseTimeStamp(timeStamp),
      };

      console.log('**** message successfully sent');
      setIsSending(false);
      return [cid, chatMessage];
    } catch (error) {
      console.log('error', error);
      setIsSending(false);
    }
    return ['', {to: '', from: '', messageType: '', message: '', time: ''}];
  };

  const sendIntent = async ({message, messageType}: MessageFormat) => {
    if (!isSendingReady) {
      return;
    }
    setIsSending(true);
    console.log('**** send intent');
    const msg = await getEncryptedMessage(
      connectedUser,
      messageReceiver.current,
      message,
    );

    const postBody = {
      fromCAIP10: connectedUser.wallets,
      fromDID: connectedUser.wallets,
      toDID: messageReceiver.current.ethAddress,
      toCAIP10: messageReceiver.current.ethAddress,
      messageContent: msg.cipherText,
      messageType: messageType,
      signature: msg.signature,
      encType: msg.encType,
      sigType: msg.sigType,
      encryptedSecret: msg.encryptedSecret,
    };

    console.log('posting intent', JSON.stringify(postBody));

    try {
      const res = await PushNodeClient.postIntent(postBody);
      if (res.toString().toLowerCase() === 'your wallet is not whitelisted') {
        showSimpleToast('Your wallet is not whitelisted');
        return;
      }
      console.log('intent send res', res);
      console.log('**** intent successfully sent');
    } catch (error) {
      console.log('error', error);
    }
    setIsIntentSendPage(false);
    setIsSending(false);
  };

  if (isIntentSendPage) {
    return [isSending, sendIntent, isSendingReady];
  } else {
    return [isSending, sendMessage, isSendingReady];
  }
};

export {useSendMessage};
