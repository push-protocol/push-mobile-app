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

  console.log(encryptedMessage);
  console.log('all god ser');
};

const useSendMessage = (
  connectedUser: ConnectedUser,
  receiverAddress: string,
): useSendMessageReturnType => {
  const [isSending, setIsSending] = useState(false);
  const [isSendingReady, setIsSendingReady] = useState(false);
  const messageReceiver = useRef<MessageReciver>({
    ethAddress: receiverAddress,
    pgpAddress: '',
  });

  useEffect(() => {
    (async () => {
      console.log('sending to', receiverAddress);
      const res = await PushNodeClient.getUser(getCAIPAddress(receiverAddress));
      if (res) {
        messageReceiver.current.pgpAddress = res.publicKey;
        setIsSendingReady(true);
      } else {
        console.log('Receiver ');
      }
    })();
  }, []);

  const sendMessage = async (message: string) => {
    setIsSending(true);
    console.log('****send message');
    await getEncryptedMessage(connectedUser, messageReceiver.current, message);
    console.log('*****');
    setIsSending(false);
  };

  return [isSending, sendMessage, isSendingReady];
};

export {useSendMessage};
