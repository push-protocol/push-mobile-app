import React from 'react';
import {Image, StyleSheet, Text, View} from 'react-native';
import Globals from 'src/Globals';

import {ChatMessage} from '../helpers/chatResolver';

type MessageComponentType = 'SENDER' | 'RECEIVER';

type MessageComponentProps = {
  chatMessage: ChatMessage;
  componentType: MessageComponentType;
};

const MessageComponent = ({
  chatMessage,
  componentType,
}: MessageComponentProps) => {
  const styles = componentType === 'SENDER' ? SenderStyle : RecipientStyle;
  const {message, messageType, time} = chatMessage;

  if (messageType === 'GIF') {
    console.log('message gif', message);
  }

  if (messageType === 'Image') {
    console.log('*****message image', typeof message);
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {messageType === 'GIF' && (
          <Image
            source={{
              uri: message,
            }}
            style={{width: 100, height: 100}}
          />
        )}
        {/* {messageType === 'GIF' && <Image source={{uri: message}} />} */}
        {messageType === 'Image' && (
          <Image
            source={{
              uri: JSON.parse(message).content,
            }}
            style={{width: '100%', height: 120}}
          />
          // <Image style={{width: 100, height: 100}} source={{uri: message}} />
        )}
        {messageType === 'Text' && <Text style={styles.text}>{message}</Text>}
      </View>

      <Text style={styles.time}>{time}</Text>
    </View>
  );
};

export default MessageComponent;

const RecipientStyle = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    maxWidth: '75%',
    marginBottom: 25,
    padding: 15,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 15,
    borderBottomRightRadius: 15,
    borderBottomLeftRadius: 20,
  },
  content: {
    marginBottom: 5,
  },

  text: {
    fontSize: 14,
    color: Globals.COLORS.BLACK,
    fontWeight: '400',
  },
  time: {fontSize: 13, textAlign: 'right', color: '#6F829E'},
});

const SenderStyle = StyleSheet.create({
  container: {
    backgroundColor: Globals.COLORS.PINK,
    width: '75%',
    marginBottom: 25,
    padding: 15,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 15,
    borderBottomLeftRadius: 20,
    alignSelf: 'flex-end',
  },
  content: {
    marginBottom: 5,
  },
  text: {
    fontSize: 14,
    color: 'white',
    fontWeight: '400',
    marginBottom: 5,
  },
  time: {fontSize: 13, textAlign: 'right', color: 'white'},
});
