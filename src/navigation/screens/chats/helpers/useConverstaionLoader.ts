import {useEffect, useRef, useState} from 'react';
import * as PushNodeClient from 'src/apis';
import {caip10ToWallet} from 'src/helpers/CAIPHelper';

import {ChatMessage, resolveCID} from './chatResolver';
import {getStoredConversationData} from './storage';

const FETCH_ONCE = 15;

const getLatestHash = async (
  combinedDID: string,
): Promise<[boolean, string]> => {
  try {
    const address = caip10ToWallet(combinedDID.split('_')[0]);
    const feeds = await PushNodeClient.getInbox(address);
    const filtertedFeeds = feeds?.filter(e => e.combinedDID === combinedDID);
    const cid = filtertedFeeds![0].threadhash;
    return [false, cid!];
  } catch (error) {
    return [true, ''];
  }
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

  const fetchChats = async (_pgpPrivateKey: string) => {
    console.log('_pgpPrivateKey: ', _pgpPrivateKey);
    isFetching.current = true;
    let chats: ChatMessage[] = [];
    let hash = currentHash.current;

    for (let i = 0; i < FETCH_ONCE; i++) {
      try {
        const [chatMessage, next_hash] = await resolveCID(hash, _pgpPrivateKey);
        chats.unshift(chatMessage);
        if (!next_hash) {
          break;
        }
        hash = next_hash;
      } catch (error) {
        console.log('Error ***', error);
        break;
      }
    }

    isFetching.current = false;

    return chats;
  };

  const fetchUnitl = async (
    _pgpPrivateKey: string,
    latestCid: string,
    stopCid: string,
  ) => {
    isFetching.current = true;
    let chats: ChatMessage[] = [];
    let hash = latestCid;

    for (let i = 0; i < FETCH_ONCE; i++) {
      try {
        const [chatMessage, next_hash] = await resolveCID(hash, _pgpPrivateKey);
        // console.log('says', hash, ':', chatMessage.message, '---->', next_hash);

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

    isFetching.current = false;
    currentHash.current = latestCid;
    return chats;
  };

  useEffect(() => {
    let chatListener: NodeJS.Timer;
    (async () => {
      console.log('fetching chats');
      setChatData([]);
      const msgs = await fetchChats(pgpPrivateKey);
      setChatData(prev => [...prev, ...msgs]);
      setIsLoading(false);
      console.log('chats loaded');

      //listen to new chats
      chatListener = setInterval(async () => {
        console.log('looking for new conversations');
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
            const newMsgs = await fetchUnitl(
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
