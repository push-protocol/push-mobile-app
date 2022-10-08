import {useEffect, useRef, useState} from 'react';
import {ConnectedUser} from 'src/apis';
import * as PushNodeClient from 'src/apis';
import {getCAIPAddress} from 'src/helpers/CAIPHelper';
import {encryptAndSign} from 'src/helpers/w2w/pgp';

type sendMessageFunc = (message: string) => Promise<void>;
type useSendMessageReturnType = [boolean, sendMessageFunc, boolean];
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
      const res = await PushNodeClient.getUser(
        messageReceiver.current.ethAddress,
      );
      if (res) {
        messageReceiver.current.pgpAddress = res.publicKey;
        setIsSendingReady(true);
      } else {
        console.log('Receiver ');
      }
    })();
  }, []);

  const sendMessage = async (message: string) => {
    if (!isSendingReady) {
      return;
    }
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
      messageType: 'Text',
      signature: msg.signature,
      encType: msg.encType,
      sigType: msg.sigType,
      encryptedSecret: msg.encryptedSecret,
    };

    console.log('posting', JSON.stringify(postBody));

    try {
      const res = await PushNodeClient.postMessage(postBody);
      console.log(res);
    } catch (error) {
      console.log('error', error);
    }
    console.log('**** message successfully sent');

    setIsSending(false);
  };

  const sendIntent = async (message: string) => {
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
      messageType: 'Text',
      signature: msg.signature,
      encType: msg.encType,
      sigType: msg.sigType,
      encryptedSecret: msg.encryptedSecret,
    };

    console.log('posting intent', JSON.stringify(postBody));

    try {
      const res = await PushNodeClient.postIntent(postBody);
      console.log(res);
    } catch (error) {
      console.log('error', error);
    }
    console.log('**** intent successfully sent');
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
