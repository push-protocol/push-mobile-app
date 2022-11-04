import {useEffect, useState} from 'react';
import {useSelector} from 'react-redux';
import * as PushNodeClient from 'src/apis';
import * as CaipHelper from 'src/helpers/CAIPHelper';
import {selectCurrentUser, selectUsers} from 'src/redux/authSlice';

import {UserChatCredentials} from '../ChatScreen';
import {getPersistedChatData, persistChatData} from './storage';
import {
  checkIfItemInCache,
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

const useChatLoader = (
  userChatCredentials: UserChatCredentials | undefined,
): [boolean, ChatData] => {
  const [isLoading, setIsLoading] = useState(true);

  const [chatData, setChatData] = useState<ChatData>({
    connectedUserData: undefined,
    feeds: [],
    requests: [],
  });

  const feedCache: ChatFeedCache = {};
  const users = useSelector(selectUsers);
  const currentUser = useSelector(selectCurrentUser);

  const setUpChatProfile = async (
    caipAddress: string,
    pgpPrivateKey: string,
  ) => {
    console.log('check user info at push node', caipAddress);
    let user = await PushNodeClient.getUser(caipAddress);

    if (!user) {
      throw new Error('User info not found');
    }

    // User info done, store to state
    console.log('we did this', pgpPrivateKey);

    const connectedUserData: PushNodeClient.ConnectedUser = {
      ...user,
      privateKey: pgpPrivateKey,
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
    if (!userChatCredentials) {
      return;
    }

    const pgpPrivateKey = userChatCredentials.pgpPrivateKey;
    const derivedAddress = users[currentUser].wallet;
    const caipAddress = CaipHelper.walletToCAIP10(derivedAddress);

    let fetchNewMessages: NodeJS.Timer;

    (async () => {
      await setUpChatProfile(caipAddress, pgpPrivateKey);
      await loadCachedInbox();
      await loadInbox(derivedAddress);

      // qeury for new threads evey 3 second
      fetchNewMessages = setInterval(async () => {
        console.log('Fetching new inbox');
        await loadInbox(derivedAddress);
      }, 3000);
    })();

    return () => clearInterval(fetchNewMessages);
  }, [userChatCredentials]);

  return [isLoading, chatData];
};
export {useChatLoader};
