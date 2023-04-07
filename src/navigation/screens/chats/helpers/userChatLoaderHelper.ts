import * as PushNodeClient from 'src/apis';
import {encryptWithRPCEncryptionPublicKeyReturnRawData} from 'src/helpers/w2w/metamaskSigUtil';
import {generateKeyPair} from 'src/helpers/w2w/pgp';

import {ChatFeedCache} from './useChatLoader';

// TODO remove from here
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

  const createdUser = await PushNodeClient.createUser({
    caip10,
    did: caip10,
    publicKey: keyPairs.publicKeyArmored,
    encryptedPrivateKey: JSON.stringify(encryptedPgpKey),
    encryptionType: 'x25519-xsalsa20-poly1305',
    signature: 'xyz',
    sigType: 'a',
  });
  console.log('create new user', createdUser);
};

export const checkIfItemInCache = (
  cache: ChatFeedCache,
  feeds: PushNodeClient.Feeds[],
) => {
  let isInCache = true;
  for (let i = 0; i < feeds.length; i++) {
    const {threadhash, combinedDID} = feeds[i];

    // update cache
    if (!cache[combinedDID] || threadhash !== cache[combinedDID]) {
      isInCache = false;
      cache[combinedDID] = threadhash!;
    }
  }
  return isInCache;
};

export const filterChatAndRequestFeeds = (
  userAddress: string,
  feeds: PushNodeClient.Feeds[],
) => {
  const chatFeeds: PushNodeClient.Feeds[] = [];
  const requestFeeds: PushNodeClient.Feeds[] = [];

  feeds.forEach(element => {
    console.log('intent is', element.intent, 'user addres', userAddress);

    if (element.intent?.includes(userAddress)) {
      chatFeeds.push(element);
    } else {
      requestFeeds.push(element);
    }
  });
  return [chatFeeds, requestFeeds];
};
