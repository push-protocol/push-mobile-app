import {IMessageIPFS} from '@pushprotocol/restapi';
import React, {useMemo, useRef} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import Globals from 'src/Globals';
import ProfilePicture from 'src/components/custom/ProfilePicture';
import {caip10ToWallet} from 'src/helpers/CAIPHelper';
import {formatAMPM, formatDate} from 'src/helpers/DateTimeHelper';

import {getTrimmedAddress} from '../helpers/chatAddressFormatter';
import ReplyMessageBubble from './ReplyMessageBubble';
import SwipeLeftView from './SwipeLeftView';
import {FileMessageComponent, TextMessage} from './messageTypes';
import {ImageMessage} from './messageTypes/ImageMessage';

export type MessageComponentType = 'SENDER' | 'RECEIVER';

type MessageComponentProps = {
  chatMessage: IMessageIPFS;
  componentType: MessageComponentType;
  includeDate: boolean;
  isGroupMessage?: boolean;
  setReplyPayload?: (payload: IMessageIPFS) => void;
  chatId?: string;
};

const MessageComponent = ({
  chatMessage,
  componentType,
  includeDate,
  isGroupMessage = false,
  setReplyPayload,
  chatId,
}: MessageComponentProps) => {
  const time = formatAMPM(chatMessage.timestamp || 0);
  const date = formatDate(chatMessage.timestamp || 0);

  const styles = componentType === 'SENDER' ? senderStyle : recipientStyle;
  const {fromDID} = chatMessage;

  const messageContent =
    chatMessage?.messageType === 'Reply'
      ? chatMessage?.messageObj?.content?.messageObj?.content
      : chatMessage?.messageContent;

  const messageType =
    chatMessage?.messageType === 'Reply'
      ? chatMessage?.messageObj?.content?.messageType
      : chatMessage?.messageType;

  const swipeRef = useRef<Swipeable>(null);

  const handleOnSwipe = (direction: string) => {
    swipeRef.current?.close();
    if (direction === 'left') {
      setReplyPayload?.(chatMessage);
    }
  };

  return (
    <GestureHandlerRootView>
      <View style={messageStyle.mainWrapper}>
        {includeDate && (
          <View style={messageStyle.dateViewWrapper}>
            <Text style={messageStyle.dateText}>{date}</Text>
          </View>
        )}
        <Swipeable
          containerStyle={styles.bubbleAlignment}
          ref={swipeRef}
          friction={1}
          overshootFriction={8}
          renderLeftActions={() => <SwipeLeftView />}
          onSwipeableWillOpen={handleOnSwipe}>
          <View style={styles.container}>
            {chatMessage?.messageType === 'Reply' && (
              <ReplyMessageBubble
                componentType="replied"
                reference={chatMessage?.messageObj?.reference}
                chatId={chatId}
                messengerType={componentType}
              />
            )}

            {isGroupMessage && componentType === 'RECEIVER' && (
              <ProfilePicture address={caip10ToWallet(fromDID)} />
            )}

            {/* Render the main message content */}
            <View>
              {isGroupMessage && componentType === 'RECEIVER' && (
                <Text style={messageStyle.groupAddress}>
                  {getTrimmedAddress(caip10ToWallet(fromDID))}
                </Text>
              )}
              {(messageType === 'GIF' || messageType === 'MediaEmbed') && (
                <ImageMessage imageSource={messageContent} time={time} />
              )}
              {messageType === 'Image' && (
                <ImageMessage
                  imageSource={JSON.parse(messageContent).content}
                  time={time}
                />
              )}
              {messageType === 'Text' && (
                <TextMessage
                  chatMessage={messageContent}
                  componentType={componentType}
                  time={time}
                />
              )}
              {messageType === 'File' && (
                <FileMessageComponent chatMessage={chatMessage} />
              )}
            </View>
          </View>
        </Swipeable>
      </View>
    </GestureHandlerRootView>
  );
};

export default MessageComponent;

const messageStyle = StyleSheet.create({
  mainWrapper: {marginHorizontal: 22},
  groupAddress: {
    color: '#657795',
    fontSize: 12,
    marginBottom: 6,
    fontWeight: '400',
  },
  dateViewWrapper: {paddingBottom: 18, paddingVertical: 4},
  dateText: {
    textAlign: 'center',
    color: '#657795',
    fontSize: 12,
    fontWeight: '400',
  },
});

const recipientStyle = StyleSheet.create({
  container: {
    marginBottom: 17,
    backgroundColor: 'white',
    minWidth: '35%',
    maxWidth: '75%',
    borderTopLeftRadius: 0,
    borderTopRightRadius: 15,
    borderBottomRightRadius: 15,
    borderBottomLeftRadius: 20,
  },
  bubbleAlignment: {
    alignItems: 'flex-start',
  },
});

const senderStyle = StyleSheet.create({
  container: {
    marginBottom: 17,
    backgroundColor: Globals.COLORS.PINK,
    minWidth: '35%',
    maxWidth: '75%',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 15,
    borderBottomLeftRadius: 20,
  },
  bubbleAlignment: {
    alignItems: 'flex-end',
  },
});
