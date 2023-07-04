import {GroupDTO} from '@pushprotocol/restapi';
import {
  ISendMessagePayload,
  getGroup,
} from '@pushprotocol/restapi/src/lib/chat';
import {ENV} from '@pushprotocol/restapi/src/lib/constants';
import * as PushNodeClient from 'src/apis';
import {isValidETHAddress, walletToPCAIP10} from 'src/push_video/helpers';

import {encryptAndSign, pgpSign} from './pgp';

interface IEncryptedRequest {
  message: string;
  encryptionType: 'PlainText' | 'pgp';
  aesEncryptedSecret: string;
  signature: string;
}

const getEncryptedRequest = async (
  receiverAddress: string,
  senderCreatedUser: PushNodeClient.ConnectedUser,
  message: string,
  isGroup: boolean,
  env: ENV,
  group: GroupDTO | null,
): Promise<IEncryptedRequest | void> => {
  if (!isGroup) {
    const receiverCreatedUser = await PushNodeClient.getUser(receiverAddress);
    if (!receiverCreatedUser) {
      throw new Error('Receiver not found!');
    }
    if (!isValidETHAddress(receiverAddress)) {
      throw new Error('Invalid receiver address!');
    }

    const senderPublicKey = JSON.parse(senderCreatedUser.publicKey).key;
    const receiverPublicKey = JSON.parse(receiverCreatedUser.publicKey).key;

    if (!receiverPublicKey) {
      if (!isValidETHAddress(receiverAddress)) {
        throw new Error('Invalid receiver address!');
      }

      const signature = await pgpSign(
        message,
        senderPublicKey,
        senderCreatedUser.privateKey!,
      );

      return {
        message: message,
        encryptionType: 'PlainText',
        aesEncryptedSecret: '',
        signature: signature,
      };
    } else {
      if (!receiverPublicKey.includes('-----BEGIN PGP PUBLIC KEY BLOCK-----')) {
        const signature = await pgpSign(
          message,
          senderPublicKey,
          senderCreatedUser.privateKey!,
        );

        return {
          message: message,
          encryptionType: 'PlainText',
          aesEncryptedSecret: '',
          signature: signature,
        };
      } else {
        const {cipherText, encryptedSecret, signature} = await encryptAndSign({
          fromPublicKeyArmored: senderPublicKey,
          toPublicKeyArmored: receiverPublicKey,
          privateKeyArmored: senderCreatedUser.privateKey!,
          plainText: message,
        });
        return {
          message: cipherText,
          encryptionType: 'pgp',
          aesEncryptedSecret: encryptedSecret,
          signature: signature,
        };
      }
    }
  } else {
    console.log('got group', group);
    throw new Error('Group messages not supported yet!');
  }
};

export const sendMessagePayload = async (
  receiverAddress: string,
  senderCreatedUser: PushNodeClient.ConnectedUser,
  messageContent: string,
  messageType: string,
  env: ENV,
): Promise<ISendMessagePayload> => {
  let isGroup = true;
  if (isValidETHAddress(receiverAddress)) {
    isGroup = false;
  }

  let group: GroupDTO | null = null;

  if (isGroup) {
    group = await getGroup({
      chatId: receiverAddress,
      env: env,
    });

    if (!group) {
      throw new Error('Group not found!');
    }
  }

  const {message, encryptionType, aesEncryptedSecret, signature} =
    (await getEncryptedRequest(
      receiverAddress,
      senderCreatedUser,
      messageContent,
      isGroup,
      env,
      group,
    )) || {};

  const body: ISendMessagePayload = {
    fromDID: walletToPCAIP10(senderCreatedUser.wallets.split(',')[0]),
    toDID: isGroup ? receiverAddress : walletToPCAIP10(receiverAddress),
    fromCAIP10: walletToPCAIP10(senderCreatedUser.wallets.split(',')[0]),
    toCAIP10: isGroup ? receiverAddress : walletToPCAIP10(receiverAddress),
    messageContent: message!,
    messageType,
    signature: signature!,
    encType: encryptionType!,
    encryptedSecret: aesEncryptedSecret!,
    sigType: 'pgp',
  };
  return body;
};
