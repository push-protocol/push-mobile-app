import {IMessageIPFS} from '@pushprotocol/restapi';
import * as PushApi from '@pushprotocol/restapi';
import {CONSTANTS} from '@pushprotocol/restapi';
import {ENV} from '@pushprotocol/restapi/src/lib/constants';
import {PushStream} from '@pushprotocol/restapi/src/lib/pushstream/PushStream';
import {useEffect, useRef, useState} from 'react';
import {usePushApi} from 'src/contexts/PushApiContext';
import envConfig from 'src/env.config';

import {SocketConfig} from './socketHelper';
import {storeConversationData} from './storage';

type pushChatDataDirectFunc = (cid: string, msg: IMessageIPFS) => void;
type loadMoreDataFunc = () => Promise<void>;
type ReactionIMessage = {[key: string]: IMessageIPFS[]};

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
  ReactionIMessage,
] => {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [chatData, setChatData] = useState<IMessageIPFS[]>([]);
  const pageBatchSize = 10;
  const pushSDKSocket = useRef<PushStream | null>(null);
  const [reactions, setReactions] = useState<ReactionIMessage>({});

  const currentHash = useRef(cid);
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
      if (SocketConfig.useSocket && !pushSDKSocket.current) {
        // use socket connection
        pushSDKSocket.current = await userPushSDKInstance.initStream(
          [
            CONSTANTS.STREAM.CHAT,
            CONSTANTS.STREAM.CHAT_OPS,
            CONSTANTS.STREAM.CONNECT,
          ],
          {connection: {retries: 5}},
        );

        if (!pushSDKSocket.current) {
          console.log('got push sdk null');
          return;
        }

        pushSDKSocket.current.connect();

        pushSDKSocket.current.on(PushApi.CONSTANTS.STREAM.CONNECT, () => {
          console.log('***$$$****socket connection success');
        });

        pushSDKSocket.current.on(PushApi.CONSTANTS.STREAM.DISCONNECT, () => {
          console.log('disconnected :(');
        });

        pushSDKSocket.current.on(
          // EVENTS.CHAT_RECEIVED_MESSAGE,
          PushApi.CONSTANTS.STREAM.CHAT,
          async message => {
            if (
              (message.reference &&
                message.reference === currentHash.current) ||
              message.chatId !== chatId
            ) {
              console.log('no new conversation');
              return;
            }

            if (message?.event === 'chat.message') {
              let messageObj: any = {
                content: message.message.content,
              };
              if (
                message.message.type === 'Reply' ||
                message.message.type === 'Reaction'
              ) {
                messageObj.reference = message.message?.reference;
              }
              const newMsgs: IMessageIPFS[] = [
                {
                  // @ts-ignore
                  cid: message.reference,
                  encryptedSecret: null,
                  fromCAIP10: message.from,
                  fromDID: message.from,
                  link: null,
                  messageType: message.message.type,
                  toCAIP10: message.to[0],
                  toDID: message.to[0],
                  messageContent: message.message.content,
                  timestamp: Number(message.timestamp),
                  encType: '',
                  signature: '',
                  sigType: '',
                  messageObj,
                },
              ];
              await storeConversationData(
                combinedDID,
                message.reference,
                newMsgs,
              );
              setChatData(prev => [...newMsgs.reverse(), ...prev]);
            }
          },
        );
      } else {
        chatListener = fetchNewChatUsingTimer();
      }
    })();

    return () => {
      if (SocketConfig.useSocket) {
        if (pushSDKSocket.current) {
          pushSDKSocket.current.disconnect();
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

  useEffect(() => {
    if (chatData?.length > 0) {
      filterChatMessages(chatData);
    }
  }, [chatData?.length]);

  const filterChatMessages = (messageList: Array<IMessageIPFS>) => {
    // remove reactions into reactions
    const reactionMessages = processChatReactions(messageList);
    if (reactionMessages) {
      // deep copy to update
      setReactions(JSON.parse(JSON.stringify(reactionMessages)));
    }
  };

  const processChatReactions = (messageList: Array<IMessageIPFS>) => {
    const reactionMessages = reactions;

    for (const message of messageList) {
      if (message.messageType === 'Reaction') {
        const reaction = message as IMessageIPFS;

        // TODO: This should be present as an interface in the restapi package
        const reference = (reaction as any).messageObj?.reference ?? '';

        if (!reactionMessages[reference]) {
          reactionMessages[reference] = [];
        }
        // Check if the reaction with the same CID already exists in the reactions array for this reference
        const exists = reactionMessages[reference].some(
          r => r.cid === reaction.cid,
        );
        if (!exists) {
          // If not, add the reaction to the array
          reactionMessages[reference].push(reaction);
        }
      }
    }

    return reactionMessages;
  };

  return [
    isLoading,
    chatData,
    pushChatDataDirect,
    loadMoreData,
    isLoadingMore,
    reactions,
  ];
};
export {useConversationLoader};
