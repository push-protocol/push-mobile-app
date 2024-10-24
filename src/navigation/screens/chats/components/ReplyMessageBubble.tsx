import {FontAwesome} from '@expo/vector-icons';
import {IMessageIPFS} from '@pushprotocol/restapi';
import React from 'react';
import {
  LayoutChangeEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Globals from 'src/Globals';
import {caip10ToWallet} from 'src/helpers/CAIPHelper';
import {formatAMPM} from 'src/helpers/DateTimeHelper';

import {getTrimmedAddress} from '../helpers/chatAddressFormatter';
import {FileMessageComponent, TextMessage} from './messageTypes';
import {ImageMessage} from './messageTypes/ImageMessage';

export type ReplyMessageBubbleType = 'replying' | 'replied';

type ReplyMessageBubbleProps = {
  chatMessage: IMessageIPFS;
  componentType: ReplyMessageBubbleType;
  onCancelReply?: () => void;
  onLayoutChange?: (nativeEvent: LayoutChangeEvent) => void;
};

const ReplyMessageBubble = ({
  chatMessage,
  componentType,
  onCancelReply,
  onLayoutChange,
}: ReplyMessageBubbleProps) => {
  const time = formatAMPM(chatMessage.timestamp || 0);
  const {messageContent, messageType, fromDID} = chatMessage;
  const styles = ReplyMessageBubbleStyles(componentType);

  return (
    <View style={styles.container} onLayout={event => onLayoutChange?.(event)}>
      {/* Render replying to and cancel reply button view */}
      {componentType === 'replying' && (
        <View style={styles.topViewWrapper}>
          <Text style={styles.replyingToText}>
            Replying to{' '}
            <Text style={styles.replyingToBoldText}>
              {getTrimmedAddress(caip10ToWallet(fromDID))}
            </Text>
          </Text>

          <Pressable
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
        <View style={styles.innerContentContainer}>
          {componentType === 'replied' && (
            <Text style={styles.groupAddress}>
              {getTrimmedAddress(caip10ToWallet(fromDID))}
            </Text>
          )}
          {messageType === 'GIF' && (
            <ImageMessage
              imageSource={messageContent}
              time={time}
              messageType="reply"
            />
          )}
          {messageType === 'Image' && (
            <ImageMessage
              imageSource={JSON.parse(messageContent).content}
              time={time}
              messageType="reply"
            />
          )}
          {messageType === 'Text' && (
            <Text numberOfLines={3} style={styles.text}>
              {messageContent}
            </Text>
          )}
          {messageType === 'File' && (
            <FileMessageComponent
              chatMessage={chatMessage}
              messageType="reply"
            />
          )}
        </View>
      </View>
    </View>
  );
};

export default ReplyMessageBubble;

const ReplyMessageBubbleStyles = (componentType: ReplyMessageBubbleType) =>
  StyleSheet.create({
    container: {
      marginVertical: 5,
      display: 'flex',
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
      backgroundColor: Globals.COLORS.DARKER_GRAY,
      marginTop: 4,
    },
    innerContentContainer: {
      width: '98.5%',
      borderRadius: 15,
      backgroundColor: Globals.COLORS.LIGHT_GRAY,
      alignSelf: 'flex-end',
      paddingVertical: 10,
      paddingHorizontal: 15,
    },
    groupAddress: {
      color: '#657795',
      fontSize: 12,
      marginBottom: 6,
      fontWeight: '400',
    },
    text: {
      fontSize: 14,
      fontWeight: '400',
      lineHeight: 20,
      textAlign: 'left',
      color: componentType === 'replying' ? 'black' : 'white',
    },
  });
