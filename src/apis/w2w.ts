import {encryptWithRPCEncryptionPublicKeyReturnRawData} from 'src/helpers/w2w/metamaskSigUtil';
import {generateKeyPair} from 'src/helpers/w2w/pgp';

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

const BASE_URL = 'https://backend.epns.io/apis';

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
  const url = BASE_URL + '/v1/w2w/users';
  const body = JSON.stringify({
    caip10,
    did,
    publicKey,
    encryptedPrivateKey,
    encryptionType,
    signature,
    sigType,
  });
  console.log('calling', url, '\nbody', 'body');

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
  fromDID,
  fromCAIP10,
  toCAIP10,
  messageContent,
  messageType,
  signature,
  encType,
  sigType,
  encryptedSecret,
}: {
  toDID: string;
  fromDID: string;
  fromCAIP10: string;
  toCAIP10: string;
  messageContent: string;
  messageType: string;
  signature: string;
  encType: string;
  sigType: string;
  encryptedSecret: string;
}): Promise<MessageIPFSWithCID | string> => {
  let data: MessageIPFSWithCID | string;
  if (messageContent.length > 0) {
    const response = await fetch(BASE_URL + '/v1/w2w/intents', {
      method: 'POST',
      headers: {
        'content-Type': 'application/json',
      },
      body: JSON.stringify({
        toDID,
        fromDID,
        fromCAIP10,
        toCAIP10,
        messageContent,
        messageType,
        signature,
        encType,
        encryptedSecret,
        sigType,
      }),
    });
    data = await response.json();
  } else {
    const response = await fetch(BASE_URL + '/v1/w2w/intents', {
      method: 'POST',
      headers: {
        'content-Type': 'application/json',
      },
      body: JSON.stringify({
        toDID,
        fromDID,
        fromCAIP10,
        messageType,
        signature,
        encType,
      }),
    });
    data = await response.json();
  }
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
  console.log('create new user', createdUser);
  return createdUser;
};
