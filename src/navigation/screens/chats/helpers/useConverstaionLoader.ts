import {useEffect, useRef, useState} from 'react';

import {ChatMessage, resolveCID} from './chatResolver';

const FETCH_ONCE = 15;

const useConversationLoader = (
  cid: string,
  pgpPrivateKey: string,
): [boolean, ChatMessage[]] => {
  const [isLoading, setIsLoading] = useState(true);
  const [chatData, setChatData] = useState<ChatMessage[]>([]);
  const currentHash = useRef(cid);
  const isFetching = useRef(false);

  const fetchChats = async (_pgpPrivateKey: string) => {
    isFetching.current = true;
    let chats: ChatMessage[] = [];
    let hash = currentHash.current;

    console.log('\nfetching');

    for (let i = 0; i < FETCH_ONCE; i++) {
      try {
        const [chatMessage, next_hash] = await resolveCID(hash, _pgpPrivateKey);
        console.log('says', hash, ':', chatMessage.message, '---->', next_hash);

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
        // if (!isFetching.current) {
        //   fetchChats(pgpPrivateKey);
        // }
      }, 3000);
      return () => clearInterval(chatListener);
    })();
  }, []);

  return [isLoading, chatData];
};
export {useConversationLoader};
