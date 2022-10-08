import {useEffect, useRef, useState} from 'react';
import * as PushNodeClient from 'src/apis';
import {caip10ToWallet} from 'src/helpers/CAIPHelper';

import {ChatMessage, resolveCID} from './chatResolver';

const FETCH_ONCE = 15;

const getLatestHash = async (
  combinedDID: string,
): Promise<[boolean, string]> => {
  try {
    const address = caip10ToWallet(combinedDID.split('_')[0]);
    const feeds = await PushNodeClient.getInbox(address);
    const filtertedFeeds = feeds?.filter(e => e.combinedDID.includes(address));

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
  combinedDID: string,
): [boolean, ChatMessage[]] => {
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

    const _currentHash = await loadMessageBatch(
      currentCid,
      chats,
      pgpPrivateKey,
      stopCid,
    );

    if (stopCid !== '') {
      currentHash.current = _currentHash;
    }
    isFetching.current = false;

    return chats;
  };

  useEffect(() => {
    let chatListener: NodeJS.Timer;
    (async () => {
      // fetch conversation datas
      console.log('fetching chats');
      const msgs = await fetchChats(pgpPrivateKey, currentHash.current);
      setChatData(prev => [...prev, ...msgs]);
      setIsLoading(false);
      console.log('chats loaded');

      // listen to new chats
      chatListener = setInterval(async () => {
        console.log('looking for new conversations', combinedDID);
        if (!isFetching.current) {
          const [error, newCid] = await getLatestHash(combinedDID);
          if (error) {
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
            setChatData(prev => [...prev, ...newMsgs]);
          }
        }
      }, 3000);
    })();

    return () => clearInterval(chatListener);
  }, []);

  return [isLoading, chatData];
};
export {useConversationLoader};
