import {IMessageIPFS} from '@pushprotocol/restapi';
import {useEffect, useMemo, useState} from 'react';
import {usePushApi} from 'src/contexts/PushApiContext';

import {
  MessengerType,
  ReplyMessageBubbleType,
} from '../components/ReplyMessageBubble';

export type ReplyMessageHookParamsType = {
  componentType?: ReplyMessageBubbleType;
  reference?: string;
  chatId?: string;
  messengerType?: MessengerType;
  chatMessage?: IMessageIPFS;
};

export type ReplyMessageHookReturnType = [
  boolean,
  IMessageIPFS | null,
  string | null,
];

const useMessageReply = ({
  componentType,
  chatMessage,
  reference,
  chatId,
}: ReplyMessageHookParamsType): ReplyMessageHookReturnType => {
  const {userPushSDKInstance} = usePushApi();
  // set and get reply payload
  const [loadingReply, setLoadingReply] = useState<boolean>(false);
  const [replyMessage, setReplyMessage] = useState<IMessageIPFS | null>(null);
  const [replyError, setReplyError] = useState<string | null>(null);

  // resolve reply payload
  useEffect(() => {
    if (componentType === 'replied') {
      if (!loadingReply && !replyMessage) {
        resolveReplyPayload();
      }
    } else {
      const newChatMessage: any = JSON.parse(JSON.stringify(chatMessage));
      if (newChatMessage?.messageType === 'Reply') {
        newChatMessage.messageType =
          newChatMessage?.messageObj?.content?.messageType;
        newChatMessage.messageContent =
          newChatMessage?.messageObj?.content?.messageObj?.content;
      }
      setLoadingReply(true);
      setReplyMessage(newChatMessage ?? null);
    }
  }, [
    componentType,
    reference,
    userPushSDKInstance?.chat,
    chatId,
    chatMessage,
  ]);

  const resolveReplyPayload = async () => {
    if (reference && chatId) {
      try {
        const payloads = await userPushSDKInstance?.chat.history(chatId, {
          reference: reference,
          limit: 1,
        });
        const payload = payloads ? payloads[0] : null;
        // check if payload is reply
        // if so, change the message type to content one
        if (payload?.messageType === 'Reply') {
          payload.messageType = payload?.messageObj?.content?.messageType;
          payload.messageContent =
            payload?.messageObj?.content?.messageObj?.content;
        }

        // finally set the reply
        setLoadingReply(true);
        setReplyMessage(payload);
        setReplyError(null);
      } catch (err) {
        console.log('ERROR', {err});
        setLoadingReply(true);
        setReplyMessage(null);
        setReplyError('Unable to load Preview');
      }
    } else {
      setLoadingReply(true);
      setReplyMessage(null);
      setReplyError('Reply reference not found');
    }
  };

  return [loadingReply, replyMessage, replyError];
};

export {useMessageReply};
