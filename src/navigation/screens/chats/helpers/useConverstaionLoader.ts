import {useEffect, useRef, useState} from 'react';
import * as PushNodeClient from 'src/apis';
import {caip10ToWallet} from 'src/helpers/CAIPHelper';

import {FETCH_ONCE} from '../constants';
import {ChatMessage, resolveCID} from './chatResolver';
import {getStoredConversationData, storeConversationData} from './storage';

type pushChatDataDirectFunc = (cid: string, msg: ChatMessage) => void;

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
      if (!next_hash || next_hash === stopCid) {
        break;
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
): [boolean, ChatMessage[], pushChatDataDirectFunc] => {
  const [isLoading, setIsLoading] = useState(true);
  const [chatData, setChatData] = useState<ChatMessage[]>([]);
  const currentHash = useRef(cid);
  const isFetching = useRef(false);

  const fetchChats = async (
    _pgpPrivateKey: string,
    currentCid: string,
    stopCid: string = '',
  ) => {
    isFetching.current = true;
    let chats: ChatMessage[] = [];

    await loadMessageBatch(currentCid, chats, pgpPrivateKey, stopCid);

    if (stopCid !== '') {
      currentHash.current = currentCid;
    }
    isFetching.current = false;

    return chats;
  };

  const pushChatDataDirect = (_cid: string, msg: ChatMessage) => {
    setChatData(prev => [...prev, msg]);
    currentHash.current = _cid;
  };

  useEffect(() => {
    let chatListener: NodeJS.Timer;
    (async () => {
      // fetch conversation datas
      console.log('fetching chats');
      setChatData([]);
      const cachedMessages = await getStoredConversationData(combinedDID);
      if (cachedMessages) {
        setChatData(prev => [...prev, ...cachedMessages]);
        setIsLoading(false);
      }
      const msgs = await fetchChats(pgpPrivateKey, currentHash.current);
      setChatData(prev => [...prev, ...msgs]);
      await storeConversationData(combinedDID, msgs);
      setIsLoading(false);
      console.log('chats loaded');

      // listen to new chats
      chatListener = setInterval(async () => {
        if (!isFetching.current) {
          const [error, newCid] = await getLatestHash(
            userAddress,
            senderAddress,
          );
          if (error) {
            console.log('got error', error);
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
            await storeConversationData(combinedDID, newMsgs);
            setChatData(prev => [...prev, ...newMsgs]);
          }
        }
      }, 3000);
    })();

    return () => clearInterval(chatListener);
  }, []);

  return [isLoading, chatData, pushChatDataDirect];
};
export {useConversationLoader};
