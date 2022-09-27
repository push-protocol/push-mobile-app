import {useEffect, useState} from 'react';

import {ChatMessage, resolveCID} from './chatResolver';

const FETCH_ONCE = 15;

const useConversationLoader = (
  cid: string,
  pgpPrivateKey: string,
): [boolean, ChatMessage[]] => {
  const [isLoading, setIsLoading] = useState(true);
  const [chatData, setChatData] = useState<ChatMessage[]>([]);

  const fetchChats = async (_cid: string, _pgpPrivateKey: string) => {
    let chats: ChatMessage[] = [];
    let hash = _cid;
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

    return chats;
  };
  useEffect(() => {
    (async () => {
      console.log('fetching chats');
      const msgs = await fetchChats(cid, pgpPrivateKey);
      setChatData(prev => [...prev, ...msgs]);
      setIsLoading(false);
      console.log('chats loaded');
    })();
  }, []);

  return [isLoading, chatData];
};
export {useConversationLoader};
