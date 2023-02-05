import {EVENTS, createSocketConnection} from '@pushprotocol/socket';
import {useEffect, useRef, useState} from 'react';
import {Socket} from 'socket.io-client';
import * as PushNodeClient from 'src/apis';
import {caip10ToWallet} from 'src/helpers/CAIPHelper';

import {FETCH_ONCE} from '../constants';
import {ChatMessage, resolveCID, resolveSocketMsg} from './chatResolver';
import {SocketConfig} from './socketHelper';
import {getStoredConversationData} from './storage';

type pushChatDataDirectFunc = (cid: string, msg: ChatMessage) => void;
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

const getLatestHash = async (
  userAddress: string,
  peerAddress: string,
): Promise<[boolean, string]> => {
  try {
    const feeds = await PushNodeClient.getInbox(caip10ToWallet(userAddress));
    const filtertedFeeds = feeds?.filter(e =>
      e.combinedDID.includes(peerAddress),
    );
    const cid = filtertedFeeds![0].threadhash;
    return [false, cid!];
  } catch (error) {
    // console.log(error);
    return [true, ''];
  }
};

const loadMessageBatch = async (
  hash: string,
  chats: ChatMessage[],
  pgpPrivateKey: string,
  stopCid: String = '',
) => {
  for (let i = 0; i < FETCH_ONCE; i++) {
    try {
      const [chatMessage, next_hash] = await resolveCID(hash, pgpPrivateKey);
      chats.unshift(chatMessage);
      if (!next_hash) {
        return null;
      }
      if (next_hash === stopCid) {
        stopCid;
      }
      hash = next_hash;
    } catch (error) {
      console.log('Error ***', error);
      break;
    }
  }

  return hash;
};

const useConversationLoader = (
  cid: string,
  pgpPrivateKey: string,
  userAddress: string,
  senderAddress: string,
  combinedDID: string,
): [
  boolean,
  ChatMessage[],
  pushChatDataDirectFunc,
  loadMoreDataFunc,
  boolean,
] => {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [chatData, setChatData] = useState<ChatMessage[]>([]);
  const currentHash = useRef(cid);
  const fetchedTill = useRef<string | null>('');
  const isFetching = useRef(false);

  const loadMoreData = async () => {
    console.log('geetting more msg', fetchedTill.current);
    if (isLoadingMore) {
      return;
    }

    if (!fetchedTill.current) {
      return;
    }

    setIsLoadingMore(true);
    const olderMsgs = await fetchChats(pgpPrivateKey, fetchedTill.current);
    console.log('got older msgs', olderMsgs.length, olderMsgs);
    setChatData(prev => [...prev, ...olderMsgs.reverse()]);
    setIsLoadingMore(false);
    console.log('new message palced');
  };

  const fetchChats = async (
    _pgpPrivateKey: string,
    currentCid: string,
    stopCid: string = '',
  ) => {
    isFetching.current = true;
    let chats: ChatMessage[] = [];

    // record till last hash chat fetched
    fetchedTill.current = await loadMessageBatch(
      currentCid,
      chats,
      pgpPrivateKey,
      stopCid,
    );

    console.log('new fetchedtill', fetchedTill.current);

    if (stopCid !== '') {
      currentHash.current = currentCid;
    }
    isFetching.current = false;

    return chats;
  };

  const pushChatDataDirect = (_cid: string, msg: ChatMessage) => {
    setChatData(prev => [msg, ...prev]);
    currentHash.current = _cid;
  };

  useEffect(() => {
    let chatListener: NodeJS.Timer;
    let pushSDKSocket: Socket | null;

    (async () => {
      // fetch conversation datas
      setChatData([]);
      const [cachedMessages, latestHash] = await getStoredConversationData(
        combinedDID,
      );

      try {
        if (cachedMessages) {
          setChatData(prev => [...prev, ...cachedMessages].reverse());
          setIsLoading(false);
        }

        if (latestHash !== currentHash.current) {
          const msgs = await fetchChats(pgpPrivateKey, currentHash.current);
          setChatData(prev => [...prev, ...msgs].reverse());
          // await storeConversationData(combinedDID, currentHash.current, msgs);
        } else {
          console.log('*** only loadend from cache');
        }
      } catch (error) {
        console.log('got error 1', error);
      }

      setIsLoading(false);

      // listen to new chats
      if (SocketConfig.useSocket) {
        // use socket connection
        pushSDKSocket = createSocketConnection({
          user: userAddress,
          env: SocketConfig.url,
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

        pushSDKSocket.on(EVENTS.CHAT_RECEIVED_MESSAGE, chat => {
          console.log('socket new message');

          if (chat.cid && chat.cid === currentHash.current) {
            console.log('no new conversation');
            return;
          }
          const inboxChat = socketResponseToInbox(chat);
          (async () => {
            const newMsgs = await resolveSocketMsg(inboxChat, pgpPrivateKey);
            // await storeConversationData(combinedDID, chat.cid, newMsgs);
            setChatData(prev => [...newMsgs.reverse(), ...prev]);
          })();
        });
      } else {
        chatListener = fetchNewChatUsingTimer();
      }
    })();

    return () => clearInterval(chatListener);
  }, []);

  const fetchNewChatUsingTimer = () => {
    let chatListener = setInterval(async () => {
      if (!isFetching.current) {
        const [error, newCid] = await getLatestHash(userAddress, senderAddress);
        if (error) {
          console.log('got error2', error);
          return;
        }
        if (newCid === currentHash.current) {
          console.log('no new conversation');
        } else {
          // got new message
          console.log('got new conversation');
          const newMsgs = await fetchChats(
            pgpPrivateKey,
            newCid,
            currentHash.current,
          );
          console.log('new message palced');
          // await storeConversationData(combinedDID, newCid, newMsgs);
          setChatData(prev => [...prev, ...newMsgs].reverse());
        }
      }
    }, 3000);

    return chatListener;
  };

  return [isLoading, chatData, pushChatDataDirect, loadMoreData, isLoadingMore];
};
export {useConversationLoader};
