import {IMessageIPFS} from '@pushprotocol/restapi';
import * as PushApi from '@pushprotocol/restapi';
import {ENV} from '@pushprotocol/restapi/src/lib/constants';
import {EVENTS, createSocketConnection} from '@pushprotocol/socket';
import {useEffect, useRef, useState} from 'react';
import {useSelector} from 'react-redux';
import {Socket} from 'socket.io-client';
import * as PushNodeClient from 'src/apis';
import {usePushApi} from 'src/contexts/PushApiContext';
import envConfig from 'src/env.config';
import {selectUsers} from 'src/redux/authSlice';

import {SocketConfig} from './socketHelper';
import {storeConversationData} from './storage';

type pushChatDataDirectFunc = (cid: string, msg: IMessageIPFS) => void;
type loadMoreDataFunc = () => Promise<void>;

const useConversationLoader = (
  cid: string,
  pgpPrivateKey: string,
  userAddress: string,
  senderAddress: string,
  combinedDID: string,
  chatId: string,
): [
  boolean,
  IMessageIPFS[],
  pushChatDataDirectFunc,
  loadMoreDataFunc,
  boolean,
] => {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [chatData, setChatData] = useState<IMessageIPFS[]>([]);
  const pageBatchSize = 10;
  const [connectedUser] = useSelector(selectUsers);

  const currentHash = useRef(cid);
  const fetchedTill = useRef<string | null>('');
  const fetchedFrom = useRef<string | null>('');

  const isFetching = useRef(false);

  const {userPushSDKInstance} = usePushApi();

  const loadMoreData = async () => {
    if (isLoadingMore) {
      return;
    }

    if (!fetchedFrom.current) {
      return;
    }

    setIsLoadingMore(true);
    const olderMsgs = await fetchChats(pgpPrivateKey, fetchedFrom.current);
    const lastMsgHash = olderMsgs[olderMsgs.length - 1].link;
    const messageToAdd = olderMsgs.slice(1, olderMsgs.length - 1);

    setChatData(prev => [...prev, ...messageToAdd]);
    setIsLoadingMore(false);

    fetchedFrom.current = lastMsgHash;
  };

  const fetchChats = async (_pgpPrivateKey: string, currentCid: string) => {
    isFetching.current = true;
    try {
      const chats = await userPushSDKInstance?.chat.history(senderAddress, {
        limit: pageBatchSize,
        reference: currentCid,
      });
      isFetching.current = false;
      return chats || [];
    } catch (err) {
      isFetching.current = false;
      return [];
    }
  };

  const pushChatDataDirect = (_cid: string, msg: IMessageIPFS) => {
    setChatData(prev => [msg, ...prev]);
    currentHash.current = _cid;
  };

  useEffect(() => {
    if (!userPushSDKInstance) {
      return;
    }
    let chatListener: NodeJS.Timer;
    let pushSDKSocket: Socket | null;

    (async () => {
      // fetch conversation datas
      try {
        const {threadHash} = await PushApi.chat.conversationHash({
          account: userAddress,
          conversationId: chatId,
          env: envConfig.ENV as ENV,
        });

        const msgs = await fetchChats(pgpPrivateKey, threadHash);
        setChatData(prev => [...prev, ...msgs]);

        currentHash.current = threadHash;
        fetchedFrom.current = msgs[msgs.length - 1].link;
      } catch (error) {}

      setIsLoading(false);

      // listen to new chats
      if (SocketConfig.useSocket) {
        // use socket connection
        pushSDKSocket = createSocketConnection({
          user: userAddress,
          env: SocketConfig.url as any,
          apiKey: SocketConfig.key,
          socketType: 'chat',
          socketOptions: {autoConnect: true, reconnectionAttempts: 3},
        });

        if (!pushSDKSocket) {
          console.log('got push sdk null');
          return;
        }

        pushSDKSocket.on(EVENTS.CONNECT, () => {
          console.log('***$$$****socket connection success');
        });

        pushSDKSocket.on(EVENTS.DISCONNECT, () => {
          console.log('disconnected :(');
        });

        pushSDKSocket.on(
          EVENTS.CHAT_RECEIVED_MESSAGE,
          async (message: PushNodeClient.MessageIPFSWithCID) => {
            if (message.cid && message.cid === currentHash.current) {
              console.log('no new conversation');
              return;
            }

            const newMsgs = await PushApi.chat.decryptConversation({
              messages: [message],
              env: envConfig.ENV as ENV,
              pgpPrivateKey,
              connectedUser: {
                ...connectedUser,
                wallets: connectedUser.wallet,
              },
            });

            await storeConversationData(combinedDID, message.cid, newMsgs);
            setChatData(prev => [...newMsgs.reverse(), ...prev]);
          },
        );
      } else {
        chatListener = fetchNewChatUsingTimer();
      }
    })();

    return () => {
      if (SocketConfig.useSocket) {
        if (pushSDKSocket) {
          pushSDKSocket.disconnect();
        }
      } else {
        clearInterval(chatListener);
      }
    };
  }, [userPushSDKInstance]);

  const fetchNewChatUsingTimer = () => {
    let chatListener = setInterval(async () => {
      if (!isFetching.current) {
        const {threadHash} = await PushApi.chat.conversationHash({
          account: userAddress,
          conversationId: chatId,
          env: envConfig.ENV as ENV,
        });

        if (threadHash !== currentHash.current) {
          // got new message
          const newMsgs = await fetchChats(pgpPrivateKey, threadHash);
          setChatData(prev => [...prev, ...newMsgs].reverse());
        }
      }
    }, 3000);

    return chatListener;
  };

  return [isLoading, chatData, pushChatDataDirect, loadMoreData, isLoadingMore];
};
export {useConversationLoader};
