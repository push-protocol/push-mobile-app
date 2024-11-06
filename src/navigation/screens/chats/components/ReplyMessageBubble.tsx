import {FontAwesome} from '@expo/vector-icons';
import {IMessageIPFS} from '@pushprotocol/restapi';
import React, {FC, memo, useCallback, useMemo} from 'react';
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
import {useMessageReply} from '../helpers/useMessageReply';
import {FileMessageComponent} from './messageTypes';
import {ImageMessage} from './messageTypes/ImageMessage';

export type ReplyMessageBubbleType = 'replying' | 'replied';
export type MessengerType = 'SENDER' | 'RECEIVER';

export type ReplyMessageBubbleProps = {
  chatMessage?: IMessageIPFS;
  componentType: ReplyMessageBubbleType;
  onCancelReply?: () => void;
  onLayoutChange?: (nativeEvent: LayoutChangeEvent) => void;
  reference?: string;
  chatId?: string;
  messengerType?: MessengerType;
  disableCancel?: boolean;
};

const ReplyMessageBubble: FC<ReplyMessageBubbleProps> = ({
  chatMessage,
  componentType,
  onCancelReply,
  onLayoutChange,
  reference,
  chatId,
  messengerType,
  disableCancel,
}) => {
  const [loadingReply, replyMessage, replyError] = useMessageReply({
    chatId,
    chatMessage,
    componentType,
    reference,
    messengerType,
  });

  const onLayoutChangeHandler = useCallback(
    (event: LayoutChangeEvent) => {
      onLayoutChange?.(event);
    },
    [onLayoutChange],
  );

  const styles = useMemo(
    () => ReplyMessageBubbleStyles(componentType, messengerType),
    [componentType, messengerType],
  );

  return (
    <View
      style={styles.container}
      onLayout={event => onLayoutChangeHandler(event)}>
      {/* Render replying to and cancel reply button view */}
      {componentType === 'replying' && (
        <View style={styles.topViewWrapper}>
          {replyMessage?.fromDID ? (
            <Text style={styles.replyingToText}>
              Replying to{' '}
              <Text style={styles.replyingToBoldText}>
                {getTrimmedAddress(caip10ToWallet(replyMessage?.fromDID))}
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
        {!loadingReply && (
          <View style={styles.innerContentContainer}>
            <Text style={styles.text}>Loading Preview...</Text>
          </View>
        )}
        {/* Render Error View */}
        {loadingReply && replyError && (
          <View style={styles.innerContentContainer}>
            <Text style={styles.text}>{replyError}</Text>
          </View>
        )}
        {/* Render Reply Message View */}
        {loadingReply && replyMessage && (
          <View style={styles.innerContentContainer}>
            {componentType === 'replied' && replyMessage?.fromDID && (
              <Text style={styles.groupAddress}>
                {getTrimmedAddress(caip10ToWallet(replyMessage?.fromDID))}
              </Text>
            )}
            {(replyMessage?.messageType === 'GIF' ||
              replyMessage?.messageType === 'MediaEmbed') && (
              <ImageMessage
                imageSource={replyMessage?.messageContent}
                messageType="reply"
              />
            )}
            {replyMessage?.messageType === 'Image' && (
              <ImageMessage
                imageSource={JSON.parse(replyMessage?.messageContent).content}
                messageType="reply"
              />
            )}
            {replyMessage?.messageType === 'Text' && (
              <Text numberOfLines={3} style={styles.text}>
                {replyMessage?.messageContent}
              </Text>
            )}
            {replyMessage?.messageType === 'File' && (
              <FileMessageComponent
                chatMessage={replyMessage}
                messageType="reply"
              />
            )}
          </View>
        )}
      </View>
    </View>
  );
};

export {ReplyMessageBubble};

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
