import {getEncryptionPublicKey} from '@metamask/eth-sig-util';
import {useEffect, useState} from 'react';
import {useSelector} from 'react-redux';
import * as PushNodeClient from 'src/apis';
import * as CaipHelper from 'src/helpers/CAIPHelper';
import CryptoHelper from 'src/helpers/CryptoHelper';
import {decryptWithWalletRPCMethod} from 'src/helpers/w2w/metamaskSigUtil';
import {selectCurrentUser, selectUsers} from 'src/redux/authSlice';

import {getPersistedChatData, persistChatData} from './storage';
import {
  checkIfItemInCache,
  createNewPgpPair,
  filterChatAndRequestFeeds,
} from './userChatLoaderHelper';

export interface ChatData {
  connectedUserData: PushNodeClient.ConnectedUser | undefined;
  feeds: PushNodeClient.Feeds[];
  requests: PushNodeClient.Feeds[];
}

export interface ChatFeedCache {
  [key: string]: string;
}

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
    console.log('check user info at push node', caipAddress);
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

    // User info done, store to state
    const connectedUserData: PushNodeClient.ConnectedUser = {
      ...user,
      privateKey: decryptedPrivateKey,
    };

    persistChatData({
      ...chatData,
      connectedUserData,
    });

    setChatData(prev => ({...prev, connectedUserData}));
  };

  const loadCachedInbox = async () => {
    const cachedData = await getPersistedChatData();

    if (cachedData) {
      setChatData(cachedData);
      setIsLoading(false);
    }
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

    // sort message based on time
    // latest chat shown at first
    feeds.sort(
      (c1, c2) =>
        Date.parse(c2.intentTimestamp) - Date.parse(c1.intentTimestamp),
    );

    const [newChatFeeds, newRequestFeeds] = filterChatAndRequestFeeds(
      ethAddress,
      feeds,
    );

    persistChatData({
      ...chatData,
      feeds: newChatFeeds,
      requests: newRequestFeeds,
    });

    setChatData(prev => ({
      ...prev,
      feeds: newChatFeeds,
      requests: newRequestFeeds,
    }));

    setIsLoading(false);
  };

  useEffect(() => {
    // request private key
    let userPk = users[currentUser].userPKey;
    userPk = userPk.includes('0x') ? userPk.slice(2) : userPk;

    // TODO: for debug, remove later
    // ('081698f3d1afb6285784c0a88601725e97f23a0115fd4f75651fbe25d0ec2b9a'); // my chrome
    // 'c39d17b1575c8d5e6e615767e19dc285d1f803d21882fb0c60f7f5b7edb759b2'; // my brave
    userPk = '081698f3d1afb6285784c0a88601725e97f23a0115fd4f75651fbe25d0ec2b9a';
    const ethPublicKey = CryptoHelper.getPublicKeyFromPrivateKey(userPk);
    const derivedAddress = CryptoHelper.getAddressFromPublicKey(ethPublicKey);

    // let derivedAddress = users[currentUser].wallet;
    const caipAddress = CaipHelper.walletToCAIP10(derivedAddress);
    const encryptionPublicKey = getEncryptionPublicKey(userPk);

    let fetchNewMessages: NodeJS.Timer;

    (async () => {
      await checkUserProfile(caipAddress, encryptionPublicKey, userPk);
      await loadCachedInbox();
      await loadInbox(derivedAddress);

      // qeury for new threads evey 3 second
      fetchNewMessages = setInterval(async () => {
        console.log('Fetching new inbox');
        await loadInbox(derivedAddress);
      }, 3000);
    })();

    return () => clearInterval(fetchNewMessages);
  }, []);

  return [isLoading, chatData];
};
export {useChatLoader};
