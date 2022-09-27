import {useEffect, useState} from 'react';

import {ChatMessage, resolveCID} from './chatResolver';

const FETCH_ONCE = 15;

const useConversationLoader = (
  cid: string,
  pgpPrivateKey: string,
): [boolean, ChatMessage[]] => {
  const [isLoading, setIsLoading] = useState(true);
  const [chatData, setChatData] = useState<ChatMessage[]>([]);
  const [currentHash, setCurrentHash] = useState(cid);

  const fetchChats = async (_pgpPrivateKey: string) => {
    let chats: ChatMessage[] = [];
    let hash = currentHash;
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

    setCurrentHash(hash);

    return chats;
  };
  useEffect(() => {
    (async () => {
      console.log('fetching chats');
      setChatData([]);
      const msgs = await fetchChats(pgpPrivateKey);
      setChatData(prev => [...prev, ...msgs]);
      setIsLoading(false);
      console.log('chats loaded');

      //listen to new chats
      const chatListener = setInterval(async () => {
        // fetchChats();
      }, 3000);
      return () => clearInterval(chatListener);
    })();
  }, []);

  return [isLoading, chatData];
};
export {useConversationLoader};
