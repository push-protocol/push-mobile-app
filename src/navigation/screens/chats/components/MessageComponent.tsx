import {IMessageIPFS} from '@pushprotocol/restapi';
import React, {useRef} from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import Globals from 'src/Globals';
import ProfilePicture from 'src/components/custom/ProfilePicture';
import {caip10ToWallet} from 'src/helpers/CAIPHelper';
import {formatAMPM, formatDate} from 'src/helpers/DateTimeHelper';

import {getTrimmedAddress} from '../helpers/chatAddressFormatter';
import {ReactionItemType, ReactionPicker} from './ReactionPicker';
import {Reactions} from './Reactions';
import {ReplyIcon} from './ReplyIcon';
import {ReplyMessageBubble} from './ReplyMessageBubble';
import {SwipeLeftView} from './SwipeLeftView';
import {FileMessageComponent, TextMessage} from './messageTypes';
import {ImageMessage} from './messageTypes/ImageMessage';

export type MessageComponentType = 'SENDER' | 'RECEIVER';

export type ReactionPayloadType = {
  messageType: string;
  message: string | undefined;
  reactionRef: string | undefined;
};

type MessageComponentProps = {
  chatMessage: IMessageIPFS;
  componentType: MessageComponentType;
  includeDate: boolean;
  isGroupMessage?: boolean;
  setReplyPayload?: (payload: IMessageIPFS) => void;
  chatId?: string;
  handleMessageLongPress?: (message: IMessageIPFS) => void;
  reactionPickerId?: any;
  handleTapOutside?: () => void;
  sendReaction?: (reactionPayload: ReactionPayloadType) => void;
  chatReactions?: IMessageIPFS[];
};

const MessageComponent = React.memo(
  ({
    chatMessage,
    componentType,
    includeDate,
    isGroupMessage = false,
    setReplyPayload,
    chatId,
    handleMessageLongPress,
    reactionPickerId,
    handleTapOutside,
    sendReaction,
    chatReactions,
  }: MessageComponentProps) => {
    const time = formatAMPM(chatMessage.timestamp || 0);
    const date = formatDate(chatMessage.timestamp || 0);
    const showMoreOptions = reactionPickerId === chatMessage?.cid;

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
        handleReply();
      }
    };

    const handleReply = () => {
      if (reactionPickerId) {
        handleTapOutside?.();
      }
      setReplyPayload?.(chatMessage);
    };

    return (
      <GestureHandlerRootView>
        <Pressable
          onPress={() => handleTapOutside?.()}
          onLongPress={() => handleMessageLongPress?.(chatMessage)}
          style={[
            messageStyle.mainWrapper,
            showMoreOptions && messageStyle.extraMargin,
          ]}>
          {includeDate && (
            <View style={messageStyle.dateViewWrapper}>
              <Text style={messageStyle.dateText}>{date}</Text>
            </View>
          )}
          {/* Render the Reaction Picker */}
          <ReactionPicker
            isVisible={showMoreOptions}
            onChangeValue={(reaction: ReactionItemType) =>
              sendReaction?.({
                messageType: 'Reaction',
                message: reaction?.reaction,
                reactionRef: chatMessage?.cid,
              })
            }
            componentType={componentType}
          />

          {isGroupMessage && componentType === 'RECEIVER' && (
            <ProfilePicture address={caip10ToWallet(fromDID)} />
          )}
          {isGroupMessage && componentType === 'RECEIVER' && (
            <Text style={messageStyle.groupAddress}>
              {getTrimmedAddress(caip10ToWallet(fromDID))}
            </Text>
          )}

          {/* Render the message content */}
          <Swipeable
            containerStyle={styles.bubbleAlignment}
            ref={swipeRef}
            friction={1}
            overshootFriction={8}
            renderLeftActions={() => (
              <SwipeLeftView style={messageStyle.swipeLeftContainer} />
            )}
            onSwipeableWillOpen={handleOnSwipe}>
            {/* Render Reactions */}
            {chatReactions && !!chatReactions.length && (
              <Reactions
                chatReactions={chatReactions}
                componentType={componentType}
              />
            )}
            <View
              style={[
                messageStyle.mainOuterContainer,
                styles.normalOuterContainerView,
              ]}>
              {/* Render ReplyIcon without overlap */}
              {showMoreOptions && (
                <View
                  style={[
                    messageStyle.replyPressableButtonStyles,
                    styles.replyPressableButtonAlignmentStyles,
                  ]}>
                  <ReplyIcon onPress={handleReply} />
                </View>
              )}
              <View style={styles.container}>
                {/* Render Reply component*/}
                {chatMessage?.messageType === 'Reply' && (
                  <ReplyMessageBubble
                    componentType="replied"
                    reference={chatMessage?.messageObj?.reference}
                    chatId={chatId}
                    messengerType={componentType}
                  />
                )}

                {/* Render the main message content */}
                <View>
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
            </View>
          </Swipeable>
        </Pressable>
      </GestureHandlerRootView>
    );
  },
  arePropsEqual,
);

function arePropsEqual(oldProps: any, newProps: any) {
  return (
    oldProps.chatMessage.cid === newProps.chatMessage.cid &&
    oldProps.reactionPickerId === newProps.reactionPickerId &&
    oldProps.chatReactions === newProps.chatReactions
  );
}

export {MessageComponent};

const messageStyle = StyleSheet.create({
  mainWrapper: {marginHorizontal: 22, zIndex: 3},
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
  mainOuterContainer: {
    flexDirection: 'row',
    position: 'relative',
  },
  replyPressableButtonStyles: {
    position: 'absolute',
    zIndex: 10,
    alignSelf: 'center',
    paddingBottom: 25,
  },
  extraMargin: {marginTop: 55},
  swipeLeftContainer: {
    paddingBottom: 25,
  },
});

const recipientStyle = StyleSheet.create({
  container: {
    marginBottom: 25,
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
  normalOuterContainerView: {
    alignSelf: 'flex-start',
  },
  replyPressableButtonAlignmentStyles: {right: -40},
});

const senderStyle = StyleSheet.create({
  container: {
    marginBottom: 25,
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
  mainOuterContainerAlignment: {
    paddingLeft: 40,
  },
  normalOuterContainerView: {
    alignSelf: 'flex-end',
  },
  replyPressableButtonAlignmentStyles: {left: -40},
});
