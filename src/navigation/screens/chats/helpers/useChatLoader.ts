import {getEncryptionPublicKey} from '@metamask/eth-sig-util';
import {useEffect, useState} from 'react';
import {useSelector} from 'react-redux';
import * as PushNodeClient from 'src/apis';
import * as CaipHelper from 'src/helpers/CAIPHelper';
import {
  decryptWithWalletRPCMethod,
  encryptWithRPCEncryptionPublicKeyReturnRawData,
} from 'src/helpers/w2w/metamaskSigUtil';
import {generateKeyPair} from 'src/helpers/w2w/pgp';
import {selectCurrentUser, selectUsers} from 'src/redux/authSlice';

const createNewPgpPair = async (
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

export interface ChatData {
  connectedUserData: PushNodeClient.ConnectedUser | undefined;
  feeds: PushNodeClient.Feeds[];
  requests: PushNodeClient.Feeds[];
}

interface ChatFeedCache {
  [key: string]: string;
}

const checkIfItemInCache = (
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

const useChatLoader = (): [boolean, ChatData] => {
  const [isLoading, setIsLoading] = useState(true);
  const [chatData, setChatData] = useState<ChatData>({
    connectedUserData: undefined,
    feeds: [],
    requests: [],
  });

  const feedCache: ChatFeedCache = {};
  const users = useSelector(selectUsers);
  const currentUser = useSelector(selectCurrentUser);

  const checkUserProfile = async (
    caipAddress: string,
    encryptionPublicKey: string,
    privateKey: string,
  ) => {
    console.log('checking for user', caipAddress);
    let user = await PushNodeClient.getUser(caipAddress);

    // register if not reigistered
    if (!user) {
      console.log('Creating new user profile..........');
      await createNewPgpPair(caipAddress, encryptionPublicKey);
    }

    // load keys
    if (!user) {
      throw new Error('Key missing');
    }

    // decript pgp from server
    const decryptedPrivateKey = decryptWithWalletRPCMethod(
      JSON.parse(user.encryptedPrivateKey),
      privateKey,
    );
    console.log('Decrypt was success');

    const connectedUserData: PushNodeClient.ConnectedUser = {
      ...user,
      privateKey: decryptedPrivateKey,
    };

    setChatData(prev => ({...prev, connectedUserData}));
  };

  const filterChatAndRequestFeeds = (
    userAddress: string,
    feeds: PushNodeClient.Feeds[],
  ) => {
    const chatFeeds: PushNodeClient.Feeds[] = [];
    const requestFeeds: PushNodeClient.Feeds[] = [];

    feeds.forEach(element => {
      if (element.intent?.includes(userAddress)) {
        chatFeeds.push(element);
      } else {
        requestFeeds.push(element);
      }
    });
    return [chatFeeds, requestFeeds];
  };

  const loadInbox = async (ethAddress: string) => {
    const feeds = await PushNodeClient.getInbox(ethAddress);

    if (!feeds) {
      return;
    }

    // check if message is already contained in cached
    // donot update if cache is same
    if (checkIfItemInCache(feedCache, feeds)) {
      return;
    }

    feeds.sort(
      (c1, c2) =>
        Date.parse(c2.intentTimestamp) - Date.parse(c1.intentTimestamp),
    );

    const [newChatFeeds, newRequestFeeds] = filterChatAndRequestFeeds(
      ethAddress,
      feeds,
    );

    setChatData(prev => ({
      ...prev,
      feeds: newChatFeeds,
      requests: newRequestFeeds,
    }));
  };

  useEffect(() => {
    // request private key
    let userPk = users[currentUser].userPKey;
    userPk = userPk.includes('0x') ? userPk.slice(2) : userPk;

    // TODO: for debug, remove later
    // ('081698f3d1afb6285784c0a88601725e97f23a0115fd4f75651fbe25d0ec2b9a'); // my chrome
    // 'c39d17b1575c8d5e6e615767e19dc285d1f803d21882fb0c60f7f5b7edb759b2'; // my brave
    // const ethPublicKey = CryptoHelper.getPublicKeyFromPrivateKey(userPk);
    // const derivedAddress = CryptoHelper.getAddressFromPublicKey(ethPublicKey);

    let derivedAddress = users[currentUser].wallet;
    const caipAddress = CaipHelper.walletToCAIP10(derivedAddress);
    const encryptionPublicKey = getEncryptionPublicKey(userPk);

    let fetechNewMessages: NodeJS.Timer;
    (async () => {
      await checkUserProfile(caipAddress, encryptionPublicKey, userPk);
      await loadInbox(derivedAddress);

      fetechNewMessages = setInterval(async () => {
        console.log('Fetching new inbox');
        await loadInbox(derivedAddress);
      }, 3000);
      setIsLoading(false);
    })();

    return () => clearInterval(fetechNewMessages);
  }, []);

  return [isLoading, chatData];
};
export {useChatLoader};
