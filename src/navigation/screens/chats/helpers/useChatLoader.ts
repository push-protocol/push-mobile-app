import * as PushSdk from '@kalashshah/react-native-sdk/src';
import {EVENTS, createSocketConnection} from '@pushprotocol/socket';
import {useEffect, useState} from 'react';
import {useRef} from 'react';
import {useSelector} from 'react-redux';
import {Socket} from 'socket.io-client';
import * as PushNodeClient from 'src/apis';
import envConfig from 'src/env.config';
import * as CaipHelper from 'src/helpers/CAIPHelper';
import {selectCurrentUser, selectUsers} from 'src/redux/authSlice';

import {UserChatCredentials} from '../ChatScreen';
import {SocketConfig} from './socketHelper';

export interface ChatData {
  connectedUserData: PushNodeClient.ConnectedUser | undefined;
  feeds: PushSdk.PushApi.IFeeds[];
  requests: PushSdk.PushApi.IFeeds[];
}

export interface ChatFeedCache {
  [key: string]: string;
}

type chatLoaderReturnType = [boolean, ChatData, () => void, fetchInboxPage: (ethAddress: string) => Promise<void>];

const useChatLoader = (
  userChatCredentials: UserChatCredentials | undefined,
): chatLoaderReturnType => {
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
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
    

    const [feeds, requests]:[any, any] = await Promise.all([
      PushSdk.chats({
        account: ethAddress,
        toDecrypt: true,
        pgpPrivateKey: userChatCredentials?.pgpPrivateKey,
        page: currentPage,
        limit: 15,
        env: envConfig.ENV as PushSdk.ENV,
      }),
      PushSdk.requests({
        account:ethAddress,
        toDecrypt: true,
        pgpPrivateKey: userChatCredentials?.pgpPrivateKey,
        page: 1,
        limit: 10,
        env: envConfig.ENV as PushSdk.ENV,
      })
    ])

    if (!feeds) {
      return;
    }

    setChatData(prev => ({
      ...prev,
      feeds: feeds,
      requests:requests
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
      // await loadCachedInbox();
      await loadInbox(derivedAddress);

      // qeury for new threads evey 3 second
      if (SocketConfig.useSocket) {
        if (!pushSDKSocket.current) {
          console.log('new socket created');
          pushSDKSocket.current = createSocketConnection({
            user: derivedAddress,
            env: SocketConfig.url as any,
            apiKey: SocketConfig.key,
            socketType: 'chat',
            socketOptions: {autoConnect: true, reconnectionAttempts: 3},
          });

          if (!pushSDKSocket.current) {
            console.log('got push sdk null');
            return;
          }

          pushSDKSocket.current.on(EVENTS.CONNECT, () => {
            console.log('connection done');
          });

          pushSDKSocket.current.on(EVENTS.DISCONNECT, () => {
            console.log('disconnected :(');
          });
          pushSDKSocket.current.on(EVENTS.CHAT_RECEIVED_MESSAGE, _ => {
            loadInbox(derivedAddress);
          });

          // pushSDKSocket.current.on(EVENTS.CHAT_UPDATE_INTENT, _ => {
          //   loadInbox(derivedAddress);
          // });
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
          // console.log('clearning socket inbox');
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

  const fetchInboxPage = async(ethAddress: string)=>{
    console.log("loading inbox");
    
    const [feeds, requests]:[any, any] = await Promise.all([
      PushSdk.chats({
        account: ethAddress,
        toDecrypt: true,
        pgpPrivateKey: userChatCredentials?.pgpPrivateKey,
        page: currentPage+1,
        limit: 10,
        env: envConfig.ENV as PushSdk.ENV,
      }),
      PushSdk.requests({
        account:ethAddress,
        toDecrypt: true,
        pgpPrivateKey: userChatCredentials?.pgpPrivateKey,
        page: 1,
        limit: 5,
        env: envConfig.ENV as PushSdk.ENV,
      })
    ])

    console.log("got reqs",requests);
    

    setChatData(prev => ({
      ...prev,
      feeds: [...prev.feeds, feeds],
      requests:[...prev.requests, requests]
    }));
    
    setCurrentPage(prev => prev + 1)
  }

  return [isLoading, chatData, refresh, fetchInboxPage];
};
export {useChatLoader};
