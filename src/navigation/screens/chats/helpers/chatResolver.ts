import * as PushNodeClient from 'src/apis';
import {caip10ToWallet} from 'src/helpers/CAIPHelper';
import CryptoHelper from 'src/helpers/CryptoHelper';
import {pgpDecrypt} from 'src/helpers/w2w/pgp';

export const parseTimeStamp = (timestamp: number) => {
  const time = new Date(timestamp);
  const date =
    time.toLocaleTimeString('en-US').slice(0, -6) +
    ':' +
    time.toLocaleTimeString('en-US').slice(-2);

  return date;
};

const getAES = async (pgpSecret: string, pgpPrivateKey: string) => {
  const AES_KEY = await pgpDecrypt(pgpSecret, pgpPrivateKey);
  return AES_KEY;
};

export interface ChatMessage {
  to: string;
  from: string;
  messageType: string;
  message: string;
  time: number;
}

type NextHash = string | null;

const resolveCID = async (
  cid: string,
  pgpPrivateKey: string,
): Promise<[ChatMessage, NextHash]> => {
  const res = await PushNodeClient.getFromIPFS(cid);

  const timeStamp = res.timestamp ? res.timestamp : 0;

  const message = await getMessage(
    res.messageContent,
    res.encryptedSecret,
    pgpPrivateKey,
  );

  const nextHash = res.link;
  const chatMessage: ChatMessage = {
    to: caip10ToWallet(res.toCAIP10),
    from: caip10ToWallet(res.fromCAIP10),
    messageType: res.messageType,
    message: message,
    time: timeStamp,
  };

  return [chatMessage, nextHash];
};

const getMessage = async (
  messageToDecrypt: string,
  encryptedSecret: string,
  pgpPrivateKey: string,
) => {
  if (encryptedSecret === '') {
    return messageToDecrypt;
  }

  const decryptedMessage = await getDecryptedMessage(
    messageToDecrypt,
    encryptedSecret,
    pgpPrivateKey,
  );

  return decryptedMessage;
};

const getDecryptedMessage = async (
  messageToDecrypt: string,
  encryptedSecret: string,
  pgpPrivateKey: string,
) => {
  const AES_KEY = await getAES(encryptedSecret, pgpPrivateKey);
  const msg: string = CryptoHelper.decryptWithAES(messageToDecrypt, AES_KEY);
  return msg;
};

export {resolveCID};
