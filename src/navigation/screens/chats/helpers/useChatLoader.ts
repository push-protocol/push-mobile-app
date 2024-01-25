import {EVENTS, createSocketConnection} from '@pushprotocol/socket';
import {CONSTANTS, IFeeds } from '@pushprotocol/restapi';
import {useEffect, useState} from 'react';
import {useRef} from 'react';
import {useSelector} from 'react-redux';
import {Socket} from 'socket.io-client';
import * as PushNodeClient from 'src/apis';
import * as CaipHelper from 'src/helpers/CAIPHelper';
import {selectCurrentUser, selectUsers} from 'src/redux/authSlice';

import {UserChatCredentials} from '../ChatScreen';
import {SocketConfig} from './socketHelper';
import { usePushApi } from 'src/contexts/PushApiContext';
import { PushStream } from '@pushprotocol/restapi/src/lib/pushstream/PushStream';

export interface ChatData {
  connectedUserData: PushNodeClient.ConnectedUser | undefined;
  feeds: IFeeds[];
  requests: IFeeds[];
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
  const { userPushSDKInstance } = usePushApi();

  const users = useSelector(selectUsers);
  const currentUser = useSelector(selectCurrentUser);
  const pushSDKSocket = useRef<PushStream | null>(null);

  const setUpChatProfile = async (
    caipAddress: string,
    pgpPrivateKey: string,
  ) => {
    let user = await PushNodeClient.getUser(caipAddress);

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
      userPushSDKInstance?.chat.list('CHATS', {
        page: currentPage,
        limit: 15,
      }),
      userPushSDKInstance?.chat.list('REQUESTS', {
        page: 1,
        limit: 10,
      }),
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
    if (!userChatCredentials || !userPushSDKInstance) {
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
          pushSDKSocket.current = await userPushSDKInstance.initStream([
            CONSTANTS.STREAM.CHAT, CONSTANTS.STREAM.CHAT_OPS, CONSTANTS.STREAM.CONNECT], 
            { connection: { retries: 3} }
          );
          pushSDKSocket.current.connect();

          if (!pushSDKSocket.current) {
            console.log('got push sdk null');
            return;
          }

          pushSDKSocket.current.on(CONSTANTS.STREAM.CONNECT, () => {
            console.log('connection done');
          });

          pushSDKSocket.current.on(CONSTANTS.STREAM.DISCONNECT, () => {
            console.log('disconnected :(');
          });

          pushSDKSocket.current.on(CONSTANTS.STREAM.CHAT, (chat) => {
            if(chat.origin === 'other') loadInbox(derivedAddress);
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
          // console.log('clearning socket inbox');
          // pushSDKSocket.current.disconnect();
        }
      } else {
        clearInterval(fetchNewMessages);
      }
    };
  }, [userChatCredentials, userPushSDKInstance]);

  const refresh = async () => {
    await loadInbox(users[currentUser].wallet);
  };

  const fetchInboxPage = async(ethAddress: string)=>{
    console.log("loading inbox");
    
    const [feeds, requests]:[any, any] = await Promise.all([
      userPushSDKInstance?.chat.list('CHATS', {
        page: currentPage + 1,
        limit: 10,
      }),
      userPushSDKInstance?.chat.list('REQUESTS', {
        page: 1,
        limit: 5,
      }),
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
