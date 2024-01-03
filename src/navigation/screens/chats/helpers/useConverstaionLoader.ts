import * as PushSdk from '@kalashshah/react-native-sdk/src';
import {EVENTS, createSocketConnection} from '@pushprotocol/socket';
import {useEffect, useRef, useState} from 'react';
import {Socket} from 'socket.io-client';
import * as PushNodeClient from 'src/apis';
import envConfig from 'src/env.config';

import {SocketConfig} from './socketHelper';

type pushChatDataDirectFunc = (
  cid: string,
  msg: PushSdk.PushApi.IMessageIPFS,
) => void;
type loadMoreDataFunc = () => Promise<void>;
const socketResponseToInbox = (chat: any) => {
  const inboxChat: PushNodeClient.InboxChat = {
    name: '',
    profilePicture: '',
    encType: chat.encType,
    encryptedSecret: chat.encryptedSecret,
    fromCAIP10: chat.fromCAIP10,
    fromDID: chat.fromDID,
    toCAIP10: chat.toCAIP10,
    toDID: chat.toDID,
    timestamp: chat.timestamp,
    lastMessage: chat.link,
    messageType: chat.messageType,
    messageContent: chat.messageContent,
    signature: chat.signature,
    signatureType: chat.sigType,
  };

  return inboxChat;
};

const useConversationLoader = (
  cid: string,
  pgpPrivateKey: string,
  userAddress: string,
  senderAddress: string,
  combinedDID: string,
  chatId: string,
): [
  boolean,
  PushSdk.PushApi.IMessageIPFS[],
  pushChatDataDirectFunc,
  loadMoreDataFunc,
  boolean,
] => {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [chatData, setChatData] = useState<PushSdk.PushApi.IMessageIPFS[]>([]);
  const pageBatchSize = 10;

  const currentHash = useRef(cid);
  const fetchedTill = useRef<string | null>('');
  const fetchedFrom = useRef<string | null>('');

  const isFetching = useRef(false);

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
      const chats = await PushSdk.history({
        account: userAddress,
        threadhash: currentCid,
        limit: pageBatchSize,
        toDecrypt: true,
        pgpPrivateKey: _pgpPrivateKey,
        env: envConfig.ENV as PushSdk.ENV,
      });

      isFetching.current = false;
      return chats;
    } catch (err) {
      isFetching.current = false;
      return [];
    }
  };

  const pushChatDataDirect = (
    _cid: string,
    msg: PushSdk.PushApi.IMessageIPFS,
  ) => {
    setChatData(prev => [msg, ...prev]);
    currentHash.current = _cid;
  };

  useEffect(() => {
    let chatListener: NodeJS.Timer;
    let pushSDKSocket: Socket | null;

    (async () => {
      // fetch conversation datas
      try {
        const {threadHash} = await PushSdk.conversationHash({
          account: userAddress,
          conversationId: chatId,
          env: envConfig.ENV as PushSdk.ENV,
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

        // TODO:
        // pushSDKSocket.on(EVENTS.CHAT_RECEIVED_MESSAGE, chat => {
        //   console.log('socket new message');

        //   if (chat.cid && chat.cid === currentHash.current) {
        //     console.log('no new conversation');
        //     return;
        //   }
        //   const inboxChat = socketResponseToInbox(chat);
        //   (async () => {
        //     const newMsgs = await resolveSocketMsg(inboxChat, pgpPrivateKey);
        //     // await storeConversationData(combinedDID, chat.cid, newMsgs);
        //     setChatData(prev => [...newMsgs.reverse(), ...prev]);
        //   })();
        // });
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
  }, []);

  const fetchNewChatUsingTimer = () => {
    let chatListener = setInterval(async () => {
      if (!isFetching.current) {
        const {threadHash} = await PushSdk.conversationHash({
          account: userAddress,
          conversationId: chatId,
          env: envConfig.ENV as PushSdk.ENV,
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
