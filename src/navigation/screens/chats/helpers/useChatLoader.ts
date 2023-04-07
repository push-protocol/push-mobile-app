import {EVENTS, createSocketConnection} from '@pushprotocol/socket';
import {useEffect, useState} from 'react';
import {useRef} from 'react';
import {useSelector} from 'react-redux';
import {Socket} from 'socket.io-client';
import * as PushNodeClient from 'src/apis';
import * as CaipHelper from 'src/helpers/CAIPHelper';
import {selectCurrentUser, selectUsers} from 'src/redux/authSlice';

import {UserChatCredentials} from '../ChatScreen';
import {SocketConfig} from './socketHelper';
import {filterChatAndRequestFeeds} from './userChatLoaderHelper';

export interface ChatData {
  connectedUserData: PushNodeClient.ConnectedUser | undefined;
  feeds: PushNodeClient.Feeds[];
  requests: PushNodeClient.Feeds[];
}

export interface ChatFeedCache {
  [key: string]: string;
}

type chatLoaderReturnType = [boolean, ChatData, () => void];

const useChatLoader = (
  userChatCredentials: UserChatCredentials | undefined,
): chatLoaderReturnType => {
  const [isLoading, setIsLoading] = useState(true);

  const [chatData, setChatData] = useState<ChatData>({
    connectedUserData: undefined,
    feeds: [],
    requests: [],
  });

  const users = useSelector(selectUsers);
  const currentUser = useSelector(selectCurrentUser);
  const pushSDKSocket = useRef<Socket | null>(null);

  const setUpChatProfile = async (
    caipAddress: string,
    pgpPrivateKey: string,
  ) => {
    console.log('aai was called');

    let user = await PushNodeClient.getUser(caipAddress);
    console.log('got user');

    if (!user) {
      throw new Error('User info not found');
    }

    // User info done, store to state
    const connectedUserData: PushNodeClient.ConnectedUser = {
      ...user,
      privateKey: pgpPrivateKey,
    };

    setChatData(prev => ({...prev, connectedUserData}));
  };

  const loadInbox = async (ethAddress: string) => {
    console.log('loading inbox @');
    const feeds = await PushNodeClient.getInbox(ethAddress);

    if (!feeds) {
      return;
    }

    setIboxData(feeds, ethAddress);
  };

  const setIboxData = (feeds: PushNodeClient.Feeds[], ethAddress: string) => {
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

    let time = Date.now();
    (async () => {
      await setUpChatProfile(caipAddress, pgpPrivateKey);
      // await loadCachedInbox();
      await loadInbox(derivedAddress);

      // qeury for new threads evey 3 second
      if (SocketConfig.useSocket) {
        if (!pushSDKSocket.current) {
          console.log('new socket created');
          pushSDKSocket.current = createSocketConnection({
            user: derivedAddress,
            env: SocketConfig.url,
            apiKey: SocketConfig.key,
            socketType: 'chat',
            socketOptions: {autoConnect: true, reconnectionAttempts: 3},
          });

          if (!pushSDKSocket.current) {
            console.log('got push sdk null');
            return;
          }

          pushSDKSocket.current.on(EVENTS.CONNECT, () => {
            console.log('connection done', time);
          });

          pushSDKSocket.current.on(EVENTS.DISCONNECT, () => {
            console.log('disconnected :(', time);
          });
          pushSDKSocket.current.on(EVENTS.CHAT_RECEIVED_MESSAGE, _ => {
            loadInbox(derivedAddress);
          });

          pushSDKSocket.current.on(EVENTS.CHAT_UPDATE_INTENT, _ => {
            loadInbox(derivedAddress);
          });
        }
      } else {
        fetchNewMessages = setInterval(async () => {
          console.log('Fetching new inbox');
          await loadInbox(derivedAddress);
        }, 3000);
      }
    })();
    return () => {
      if (SocketConfig.useSocket) {
        if (pushSDKSocket.current) {
          console.log('clearning socket');
          // pushSDKSocket.current.disconnect();
        }
      } else {
        clearInterval(fetchNewMessages);
      }
    };
  }, [userChatCredentials]);

  const refresh = async () => {
    await loadInbox(users[currentUser].wallet);
  };

  return [isLoading, chatData, refresh];
};
export {useChatLoader};
