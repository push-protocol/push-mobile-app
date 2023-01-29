import React from 'react';
import {StyleSheet, View} from 'react-native';

import {ChatMessage} from '../helpers/chatResolver';
import {FileMessageComponent, TextMessage} from './messageTypes';
import {ImageMessage} from './messageTypes/ImageMessage';

export type MessageComponentType = 'SENDER' | 'RECEIVER';

type MessageComponentProps = {
  chatMessage: ChatMessage;
  componentType: MessageComponentType;
};

const MessageComponent = ({
  chatMessage,
  componentType,
}: MessageComponentProps) => {
  const styles = componentType === 'SENDER' ? SenderStyle : RecipientStyle;
  const {message, messageType} = chatMessage;

  return (
    <View style={styles.container}>
      {messageType === 'GIF' && (
        <ImageMessage
          imageSource={chatMessage.message}
          time={chatMessage.time}
        />
      )}
      {messageType === 'Image' && (
        <ImageMessage
          imageSource={JSON.parse(message).content}
          time={chatMessage.time}
        />
      )}
      {messageType === 'Text' && (
        <TextMessage chatMessage={chatMessage} componentType={componentType} />
      )}
      {messageType === 'File' && (
        <FileMessageComponent chatMessage={chatMessage} />
      )}
    </View>
  );
};

export default MessageComponent;

const RecipientStyle = StyleSheet.create({
  container: {
    alignSelf: 'flex-start',
    marginBottom: 17,
  },
});

const SenderStyle = StyleSheet.create({
  container: {
    alignSelf: 'flex-end',
    marginBottom: 17,
  },
});
