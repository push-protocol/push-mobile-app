import {FontAwesome} from '@expo/vector-icons';
import {IMessageIPFS} from '@pushprotocol/restapi';
import React, {useEffect, useState} from 'react';
import {
  LayoutChangeEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Globals from 'src/Globals';
import {usePushApi} from 'src/contexts/PushApiContext';
import {caip10ToWallet} from 'src/helpers/CAIPHelper';

import {getTrimmedAddress} from '../helpers/chatAddressFormatter';
import {FileMessageComponent} from './messageTypes';
import {ImageMessage} from './messageTypes/ImageMessage';

export type ReplyMessageBubbleType = 'replying' | 'replied';
export type MessengerType = 'SENDER' | 'RECEIVER';

type ReplyMessageBubbleProps = {
  chatMessage?: IMessageIPFS;
  componentType: ReplyMessageBubbleType;
  onCancelReply?: () => void;
  onLayoutChange?: (nativeEvent: LayoutChangeEvent) => void;
  reference?: string;
  chatId?: string;
  messengerType?: MessengerType;
  disableCancel?: boolean;
};

const ReplyMessageBubble = ({
  chatMessage,
  componentType,
  onCancelReply,
  onLayoutChange,
  reference,
  chatId,
  messengerType,
  disableCancel,
}: ReplyMessageBubbleProps) => {
  const {userPushSDKInstance} = usePushApi();
  // set and get reply payload
  const [replyPayloadManager, setReplyPayloadManager] = useState<{
    payload: IMessageIPFS | null;
    loaded: boolean;
    err: string | null;
  }>({payload: null, loaded: false, err: null});

  // resolve reply payload
  useEffect(() => {
    if (!replyPayloadManager.loaded && !replyPayloadManager?.payload) {
      if (componentType === 'replied') {
        resolveReplyPayload();
      } else {
        const newChatMessage = JSON.parse(JSON.stringify(chatMessage));
        if (newChatMessage?.messageType === 'Reply') {
          newChatMessage.messageType =
            newChatMessage?.messageObj?.content?.messageType;
          newChatMessage.messageContent =
            newChatMessage?.messageObj?.content?.messageObj?.content;
        }
        setReplyPayloadManager({
          ...replyPayloadManager,
          payload: newChatMessage ?? null,
          loaded: true,
        });
      }
    }
  }, [
    replyPayloadManager,
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
        setReplyPayloadManager({
          ...replyPayloadManager,
          payload: payload,
          loaded: true,
        });
      } catch (err) {
        console.log('ERROR', {err});
        setReplyPayloadManager({
          ...replyPayloadManager,
          payload: null,
          loaded: true,
          err: 'Unable to load Preview',
        });
      }
    } else {
      console.log('Else');
      setReplyPayloadManager({
        ...replyPayloadManager,
        payload: null,
        loaded: true,
        err: 'Reply reference not found',
      });
    }
  };

  const {payload} = replyPayloadManager;
  const styles = ReplyMessageBubbleStyles(componentType, messengerType);

  return (
    <View style={styles.container} onLayout={event => onLayoutChange?.(event)}>
      {/* Render replying to and cancel reply button view */}
      {componentType === 'replying' && (
        <View style={styles.topViewWrapper}>
          {payload?.fromDID ? (
            <Text style={styles.replyingToText}>
              Replying to{' '}
              <Text style={styles.replyingToBoldText}>
                {getTrimmedAddress(caip10ToWallet(payload?.fromDID))}
              </Text>
            </Text>
          ) : (
            <View />
          )}

          <Pressable
            disabled={disableCancel}
            style={styles.crossButton}
            hitSlop={styles.crossHitSlop}
            onPress={onCancelReply}>
            <FontAwesome
              name="close"
              size={11}
              color={Globals.COLORS.CHAT_LIGHT_DARK}
            />
          </Pressable>
        </View>
      )}
      {/* Render Reply bubble with content*/}
      <View style={styles.outerContentContainer}>
        {/* Render Loading View */}
        {!replyPayloadManager.loaded && (
          <View style={styles.innerContentContainer}>
            <Text style={styles.text}>Loading Preview...</Text>
          </View>
        )}
        {/* Render Error View */}
        {replyPayloadManager.loaded && replyPayloadManager.err && (
          <View style={styles.innerContentContainer}>
            <Text style={styles.text}>{replyPayloadManager.err}</Text>
          </View>
        )}
        {/* Render Reply Message View */}
        {replyPayloadManager.loaded && replyPayloadManager.payload && (
          <View style={styles.innerContentContainer}>
            {componentType === 'replied' && payload?.fromDID && (
              <Text style={styles.groupAddress}>
                {getTrimmedAddress(caip10ToWallet(payload?.fromDID))}
              </Text>
            )}
            {(payload?.messageType === 'GIF' ||
              payload?.messageType === 'MediaEmbed') && (
              <ImageMessage
                imageSource={payload?.messageContent}
                messageType="reply"
              />
            )}
            {payload?.messageType === 'Image' && (
              <ImageMessage
                imageSource={JSON.parse(payload?.messageContent).content}
                messageType="reply"
              />
            )}
            {payload?.messageType === 'Text' && (
              <Text numberOfLines={3} style={styles.text}>
                {payload?.messageContent}
              </Text>
            )}
            {payload?.messageType === 'File' && (
              <FileMessageComponent chatMessage={payload} messageType="reply" />
            )}
          </View>
        )}
      </View>
    </View>
  );
};

export default ReplyMessageBubble;

const ReplyMessageBubbleStyles = (
  componentType: ReplyMessageBubbleType,
  messengerType?: MessengerType,
) =>
  StyleSheet.create({
    container: {
      marginVertical: 5,
      width: '100%',
      paddingHorizontal: 8,
    },
    topViewWrapper: {
      width: '100%',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 5,
    },
    replyingToText: {
      color: Globals.COLORS.CHAT_LIGHT_DARK,
      fontSize: 10,
      lineHeight: 16,
      fontWeight: '300',
    },
    replyingToBoldText: {
      fontWeight: '500',
    },
    crossButton: {
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1.5,
      borderColor: Globals.COLORS.CHAT_LIGHT_DARK,
      height: 15,
      width: 15,
    },
    crossHitSlop: {
      top: 8,
      right: 8,
      bottom: 12,
      left: 12,
    },
    outerContentContainer: {
      width: '100%',
      borderRadius: 15,
      backgroundColor:
        componentType === 'replying' || messengerType === 'RECEIVER'
          ? Globals.COLORS.DARKER_GRAY
          : Globals.COLORS.REPLY_LIGHT_PINK,
      marginTop: 4,
      paddingLeft: 5,
    },
    innerContentContainer: {
      width: '100%',
      borderRadius: 15,
      backgroundColor:
        componentType === 'replying' || messengerType === 'RECEIVER'
          ? Globals.COLORS.LIGHT_GRAY
          : Globals.COLORS.REPLY_DARK_PINK,
      alignSelf: 'flex-end',
      paddingVertical: 10,
      paddingHorizontal: 15,
    },
    groupAddress: {
      color:
        componentType === 'replying' || messengerType === 'RECEIVER'
          ? Globals.COLORS.CHAT_LIGHT_DARK
          : Globals.COLORS.WHITE,
      fontSize: 12,
      marginBottom: 6,
      fontWeight: '400',
    },
    text: {
      fontSize: 14,
      fontWeight: '400',
      lineHeight: 20,
      textAlign: 'left',
      color:
        componentType === 'replying' || messengerType === 'RECEIVER'
          ? Globals.COLORS.BLACK
          : Globals.COLORS.WHITE,
    },
  });
