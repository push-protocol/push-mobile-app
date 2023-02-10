import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {formatAMPM, formatDate} from 'src/helpers/DateTimeHelper';

import {ChatMessage} from '../helpers/chatResolver';
import {FileMessageComponent, TextMessage} from './messageTypes';
import {ImageMessage} from './messageTypes/ImageMessage';

export type MessageComponentType = 'SENDER' | 'RECEIVER';

type MessageComponentProps = {
  chatMessage: ChatMessage;
  componentType: MessageComponentType;
  includeDate: boolean;
};

const MessageComponent = ({
  chatMessage,
  componentType,
  includeDate,
}: MessageComponentProps) => {
  const time = formatAMPM(chatMessage.time);
  const date = formatDate(chatMessage.time);

  const styles = componentType === 'SENDER' ? SenderStyle : RecipientStyle;
  const {message, messageType} = chatMessage;

  return (
    <View style={{marginHorizontal: 22}}>
      {includeDate && (
        <View style={{paddingBottom: 18, paddingVertical: 4}}>
          <Text
            style={{
              textAlign: 'center',
              color: '#657795',
              fontSize: 12,
              fontWeight: '400',
            }}>
            {date}
          </Text>
        </View>
      )}
      <View style={styles.container}>
        {messageType === 'GIF' && (
          <ImageMessage imageSource={chatMessage.message} time={time} />
        )}
        {messageType === 'Image' && (
          <ImageMessage imageSource={JSON.parse(message).content} time={time} />
        )}
        {messageType === 'Text' && (
          <TextMessage
            chatMessage={chatMessage}
            componentType={componentType}
            time={time}
          />
        )}
        {messageType === 'File' && (
          <FileMessageComponent chatMessage={chatMessage} />
        )}
      </View>
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
