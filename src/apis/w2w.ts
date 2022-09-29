import ENV_CONFIG from 'src/env.config';

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
  numMsg: number;
  allowedNumMsg: number;
  linkedListHash?: string | null;
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
}

export interface ConnectedUser extends User {
  privateKey: string;
}

const BASE_URL = 'https://backend-dev.epns.io/apis';

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
  const response = await fetch(ENV_CONFIG.EPNS_SERVER + '/v1/w2w/users', {
    method: 'POST',
    headers: {
      'content-Type': 'application/json',
    },
    body: JSON.stringify({
      caip10,
      did,
      publicKey,
      encryptedPrivateKey,
      encryptionType,
      signature,
      sigType,
    }),
  }).catch(e => {
    console.log(e);
    throw new Error(e);
  });

  console.log(response);

  const data: User = await response.json();
  return data;
};

export const getUser = async (caip10: string): Promise<User | undefined> => {
  let retry = 0;

  for (let i = 0; i < 3; i++) {
    try {
      let path = '/v1/w2w/users';
      if (caip10) {
        path += `?caip10=${caip10}`;
      }
      console.log('calling', BASE_URL + path);

      const response = await fetch(BASE_URL + path, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data: User = await response.json();
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

export const getInbox = async (did: string): Promise<Feeds[] | undefined> => {
  let retry = 0;
  for (let i = 0; i < 3; i++) {
    try {
      const path = BASE_URL + '/v1/w2w/users/eip155:' + did + '/messages';
      console.log('calling', path);

      const response = await fetch(path, {
        method: 'GET',
      });
      if (response.status >= 500) {
        continue;
      }
      const data: Feeds[] = await response.json();
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

export const postMessage = async ({
  fromCAIP10,
  fromDID,
  toDID,
  toCAIP10,
  messageContent,
  messageType,
  signature,
  encType,
  sigType,
  encryptedSecret,
}: {
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
}): Promise<MessageIPFSWithCID | string> => {
  const response = await fetch(BASE_URL + '/v1/w2w/messages', {
    method: 'POST',
    headers: {
      'content-Type': 'application/json',
    },
    body: JSON.stringify({
      fromCAIP10,
      toCAIP10,
      fromDID,
      toDID,
      messageContent,
      messageType,
      signature,
      encType,
      encryptedSecret,
      sigType,
    }),
  });
  if (response.status > 299) {
    throw new Error('Error posting message');
  }
  const data: MessageIPFSWithCID | string = await response.json();
  return data;
};
