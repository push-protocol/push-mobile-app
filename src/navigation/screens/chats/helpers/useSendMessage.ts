import {useEffect, useRef, useState} from 'react';
import {ConnectedUser, createUser} from 'src/apis';
import * as PushNodeClient from 'src/apis';
import {ToasterOptions} from 'src/components/indicators/Toaster';
import {caip10ToWallet, getCAIPAddress} from 'src/helpers/CAIPHelper';
import {encryptAndSign} from 'src/helpers/w2w/pgp';

import {ChatMessage} from './chatResolver';
import {storeConversationData} from './storage';

// import {storeConversationData} from './storage';

export interface MessageFormat {
  message: string;
  messageType: 'GIF' | 'Text';
  combinedDID: string;
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
type MessageReciver = {ethAddress: string; pgpAddress: string};

const getEncryptedMessage = async (
  connectedUser: ConnectedUser,
  messageReceiver: MessageReciver,
  message: string,
) => {
  // if pgpAddress null then no need to encrypt
  if (messageReceiver.pgpAddress === '') {
    return {
      cipherText: message,
      encryptedSecret: '',
      signature: '',
      sigType: 'pgp',
      encType: 'PlainText',
    };
  }
  const encryptedMessage = await encryptAndSign({
    plainText: message,
    fromPublicKeyArmored: connectedUser.publicKey,
    toPublicKeyArmored: messageReceiver.pgpAddress,
    privateKeyArmored: connectedUser.privateKey,
  });

  return encryptedMessage;
};

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
      console.log('we got res', res);

      if (res && res !== null) {
        messageReceiver.current.pgpAddress = res.publicKey;
        console.log('Receiver addrs found');
      } else {
        console.log('Receiver not found', res);
      }
      setIsSendingReady(true);
    })();
  }, []);

  const sendMessage = async ({
    message,
    messageType,
    combinedDID,
  }: MessageFormat): Promise<[string, ChatMessage]> => {
    console.log('sending was called', isSendingReady);

    if (messageReceiver.current.pgpAddress === '') {
      showToast(
        'Wait for the user to accpet the intent',
        '',
        ToasterOptions.TYPE.GRADIENT_PRIMARY,
      );
      return generateNullRespose();
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
      messageType: messageType,
      signature: msg.signature,
      encType: msg.encType,
      sigType: msg.sigType,
      encryptedSecret: msg.encryptedSecret,
    };

    const chatMessage: ChatMessage = {
      to: caip10ToWallet(postBody.toCAIP10),
      from: caip10ToWallet(postBody.fromCAIP10),
      messageType: postBody.messageType,
      message: message,
      time: Date.now(),
    };

    try {
      // temporarily display temp message
      setTempChatMessage(chatMessage);

      const res = await PushNodeClient.postMessage(postBody);
      if (typeof res === 'string') {
        // show error toast
        showToast(res, '', ToasterOptions.TYPE.GRADIENT_PRIMARY);
        setIsSending(false);
        return generateNullRespose();
      }
      // add to cache
      const cid = res.cid;
      await storeConversationData(combinedDID, cid, [chatMessage]);
      console.log('**** message successfully sent');
      return [cid, chatMessage];
    } catch (error) {
      console.log('error', error);
    } finally {
      setIsSending(false);
    }
    return generateNullRespose();
  };

  const checkIsUserNew = (rec: MessageReciver) => {
    return rec.pgpAddress === '';
  };

  const createEmptyUser = async (rec: MessageReciver) => {
    await createUser({
      caip10: rec.ethAddress,
      did: rec.ethAddress,
      publicKey: '',
      encryptedPrivateKey: '',
      encryptionType: '',
      signature: 'pgp',
      sigType: 'pgp',
    });
  };

  const sendIntent = async ({message, messageType}: MessageFormat) => {
    if (!isSendingReady) {
      return;
    }

    console.log('***receiver was', messageReceiver.current);
    const receiver = messageReceiver.current;
    const isUserNew = checkIsUserNew(receiver);
    if (isUserNew) {
      await createEmptyUser(receiver);
    }

    // if (messageReceiver.current.pgpAddress === '') {
    //   showToast(
    //     'PGP address of the user not available',
    //     '',
    //     ToasterOptions.TYPE.GRADIENT_PRIMARY,
    //   );

    //   return;
    // }

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
      if (typeof res === 'string') {
        console.log('error posting intent', res);
        showToast(res, '', ToasterOptions.TYPE.GRADIENT_PRIMARY);
        setIsSending(false);
        return;
      }
      console.log('intent send res', res);
      console.log('**** intent successfully sent');
    } catch (error) {
      console.log('error', error);
    }

    showToast(
      'Intent sent succesfully',
      '',
      ToasterOptions.TYPE.GRADIENT_SECONDARY,
    );

    setIsIntentSendPage(false);
    setIsSending(false);
  };

  if (isIntentSendPage) {
    return [isSending, sendIntent, isSendingReady, tempChatMessage];
  } else {
    return [isSending, sendMessage, isSendingReady, tempChatMessage];
  }
};

export {useSendMessage};
