import {ISendMessagePayload} from '@pushprotocol/restapi/src/lib/chat';
import {ENV} from '@pushprotocol/restapi/src/lib/constants';
import envConfig from 'src/env.config';
import {encryptWithRPCEncryptionPublicKeyReturnRawData} from 'src/helpers/w2w/metamaskSigUtil';
import {generateKeyPair} from 'src/helpers/w2w/pgp';
import {sendMessagePayload} from 'src/helpers/w2w/sendMessagePayload';
import {pgpSignBody} from 'src/navigation/screens/chats/helpers/signatureHelper';

import {MessageIPFS} from './ipfs';

export interface User {
  did: string;
  wallets: string;
  profilePicture: string | null;
  publicKey: string;
  encryptedPrivateKey: string;
  encryptionType: string;
  signature: string;
  sigType: string;
  about: string | null;
  name: string | null;
  encryptedPassword: string | null;
  nftOwner: string | null;
  numMsg: number;
  allowedNumMsg: number;
  linkedListHash?: string | null;
  nfts?: [] | null;
}

export interface InboxChat {
  name: string;
  profilePicture: string;
  timestamp: number;
  fromDID: string;
  toDID: string;
  fromCAIP10: string;
  toCAIP10: string;
  lastMessage: string;
  messageType: string;
  encType: string;
  signature: string;
  signatureType: string;
  encryptedSecret: string;
  messageContent?: string;
}

export interface Feeds {
  // This property contains all the info to be displayed on the sidebar for the other peer's information
  // Such as the decrypted message content and peer's profilePicture
  msg: InboxChat;
  did: string;
  wallets: string;
  profilePicture: string | null;
  publicKey: string | null;
  about: string | null;
  threadhash: string | null;
  intent: string | null;
  intentSentBy: string | null;
  intentTimestamp: string;
  combinedDID: string;
  cid: string;
  chatId?: string;
}

export interface ConnectedUser extends User {
  privateKey: string;
}

export type MessageReciver = {ethAddress: string; pgpAddress: string};

const BASE_URL = envConfig.EPNS_SERVER;

export const createUser = async ({
  caip10,
  did,
  publicKey,
  encryptedPrivateKey,
  encryptionType,
  signature,
  sigType,
}: {
  caip10: string;
  did: string;
  publicKey: string;
  encryptedPrivateKey: string;
  encryptionType: string;
  signature: string;
  sigType: string;
}): Promise<User> => {
  const url = BASE_URL + '/v1/users';
  const body = JSON.stringify({
    caip10,
    did,
    publicKey,
    encryptedPrivateKey,
    encryptionType,
    signature,
    sigType,
  });

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'content-Type': 'application/json',
    },
    body: body,
  }).catch(e => {
    console.log(e);
    throw new Error(e);
  });

  const data: User = await response.json();
  return data;
};

export const createEmptyUser = async (rec: MessageReciver) => {
  return await createUser({
    caip10: rec.ethAddress,
    did: rec.ethAddress,
    publicKey: '',
    encryptedPrivateKey: '',
    encryptionType: '',
    signature: 'pgp',
    sigType: 'pgp',
  });
};

export const getUser = async (caip10: string): Promise<User | undefined> => {
  let retry = 0;

  for (let i = 0; i < 3; i++) {
    try {
      let path = '/v1/users';
      if (caip10) {
        path += `?caip10=${caip10}`;
      }

      const response = await fetch(BASE_URL + path, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data: User = await response.json();

      try {
        JSON.parse(data.publicKey);
      } catch {
        data.publicKey = JSON.stringify({
          key: data.publicKey,
        });
      }

      return data;
    } catch (err) {
      if (retry > 1) {
        console.log('An Error Occurred! Please Reload the Page');
      }
      console.log('Error in the API call', err);
      retry++;
      continue;
    }
  }
};

export const approveIntent2 = async (body: any) => {
  const response = await fetch(BASE_URL + '/v1/chat/request/accept', {
    method: 'PUT',
    headers: {
      'content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (response.status < 200 || response.status > 299) {
    throw new Error('Error changing intent status');
  }
  return true;
};

export const getInbox = async (did: string): Promise<Feeds[] | undefined> => {
  let retry = 0;
  for (let i = 0; i < 3; i++) {
    try {
      const path = `${BASE_URL}/v1/chat/users/eip155:${did}/messages`;
      const response = await fetch(path, {
        method: 'GET',
      });
      if (response.status >= 500) {
        continue;
      }
      // const data: Feeds[] = await response.json();
      const raw_data: any = await response.json();
      const data: Feeds[] = raw_data.filter(
        (el: any) => !('groupInformation' in el),
      );
      return data;
    } catch (err) {
      if (retry > 1) {
        console.log('An Error Occurred! Please Reload the Page');
      }
      console.log('Error in the API call', err);
      retry++;
      continue;
    }
  }
};

export interface MessageIPFSWithCID extends MessageIPFS {
  cid: string;
}

export const postMessage = async (body: {
  fromCAIP10: string;
  fromDID: string;
  toCAIP10: string;
  toDID: string;
  messageContent: string;
  messageType: string;
  signature: string;
  encType: string;
  sigType: string;
  encryptedSecret: string;
  verificationProof: string;
}): Promise<MessageIPFSWithCID | string> => {
  const response = await fetch(BASE_URL + '/v1/chat/message', {
    method: 'POST',
    headers: {
      'content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  if (response.status > 299) {
    throw new Error('Error posting message');
  }
  const data: MessageIPFSWithCID | string = await response.json();
  return data;
};

export const approveIntent = async (
  fromDID: string,
  toDID: string,
  status: string,
  signature: string,
  sigType: string,
): Promise<string> => {
  const response = await fetch(BASE_URL + '/v1/w2w/intents', {
    method: 'PUT',
    headers: {
      'content-Type': 'application/json',
    },
    body: JSON.stringify({
      toDID,
      fromDID,
      status,
      signature,
      sigType,
    }),
  });
  if (response.status < 200 || response.status > 299) {
    throw new Error('Error changing intent status');
  }
  return await response.json();
};

export const postIntent = async ({
  toDID,
  messageContent,
  messageType,
  sigType,
  connectedUser,
}: {
  toDID: string;
  messageContent: string;
  messageType: string;
  sigType: string;
  connectedUser: ConnectedUser;
}): Promise<MessageIPFSWithCID | string> => {
  let data: MessageIPFSWithCID | string;
  const apiUrl = `${BASE_URL}/v1/chat/request`;

  const body: ISendMessagePayload = await sendMessagePayload(
    toDID,
    connectedUser,
    messageContent,
    messageType,
    envConfig.ENV as ENV,
  );

  const bodyToBeHashed = {
    fromDID: body.fromDID,
    toDID: body.toDID,
    messageContent: body.messageContent,
    messageType: messageType,
  };

  const verificationProof = await pgpSignBody({bodyToBeHashed});
  body.verificationProof = sigType + ':' + verificationProof;

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  data = await response.json();
  return data;
};

export const createNewPgpPair = async (
  caip10: string,
  encryptionPublicKey: string,
) => {
  // Obtain pgp key
  const keyPairs = await generateKeyPair();

  const encryptedPgpKey = encryptWithRPCEncryptionPublicKeyReturnRawData(
    keyPairs.privateKeyArmored,
    encryptionPublicKey,
  );

  const createdUser = await createUser({
    caip10,
    did: caip10,
    publicKey: keyPairs.publicKeyArmored,
    encryptedPrivateKey: JSON.stringify(encryptedPgpKey),
    encryptionType: 'x25519-xsalsa20-poly1305',
    signature: 'xyz',
    sigType: 'a',
  });

  console.log('create new user');
  return createdUser;
};

export const isIntentAccepted = async (addrs: string, senderAddrs: string) => {
  const uri = `${BASE_URL}/v1/chat/users/${addrs}/messages`;
  const res = await fetch(uri)
    .then(r => r.json())
    .then(arr =>
      arr.filter((e: any) => {
        console.log(e.combinedDID);
        return e.combinedDID.indexOf(senderAddrs) !== -1;
      }),
    );

  const intent = res[0].intent;
  const count = (intent.match(/eip155/g) || []).length;

  return count >= 2;
};

export const getIntentStatus = async (addrs: string, senderAddrs: string) => {
  const uri = `${BASE_URL}/v1/chat/users/${addrs}/messages`;
  const res = await fetch(uri)
    .then(r => r.json())
    .then(arr =>
      arr.filter((e: any) => {
        console.log(e.combinedDID);
        return e.combinedDID.indexOf(senderAddrs) !== -1;
      }),
    );

  const intent: string = res[0].intent;
  const isIntentSent = intent.indexOf(addrs) !== -1;
  const isIntentReceived = intent.indexOf(senderAddrs) !== -1;
  const isAccepted = isIntentSent && isIntentReceived;
  if (isAccepted) {
    return [false, false];
  }
  return [isIntentSent, isIntentReceived]; // isIntentSent isIntentAccepted
};
