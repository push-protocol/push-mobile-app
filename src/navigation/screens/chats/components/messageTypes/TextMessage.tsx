import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import Globals from 'src/Globals';

import {ChatMessage} from '../../helpers/chatResolver';
import {MessageComponentType} from '../MessageComponent';

export const TextMessage = ({
  chatMessage,
  componentType,
}: {
  chatMessage: ChatMessage;
  componentType: MessageComponentType;
}) => {
  const styles = TextStyle(componentType);
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.text}>{chatMessage.message}</Text>
        <Text style={styles.time}>{chatMessage.time}</Text>
      </View>
    </View>
  );
};

export default TextMessage;

const TextStyle = (componentType: MessageComponentType) =>
  StyleSheet.create({
    container: {
      backgroundColor:
        componentType === 'RECEIVER' ? 'white' : Globals.COLORS.PINK,
      minWidth: '75%',
      maxWidth: '75%',
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderTopLeftRadius: componentType === 'RECEIVER' ? 0 : 15,
      borderTopRightRadius: componentType === 'RECEIVER' ? 15 : 0,
      borderBottomRightRadius: 15,
      borderBottomLeftRadius: 20,
      color: Globals.COLORS.BLACK,
    },
    text: {
      paddingTop: 12,
      fontSize: 14,
      fontWeight: '400',
      marginBottom: 5,
      color: componentType === 'RECEIVER' ? 'black' : 'white',
    },
    time: {
      fontSize: 13,
      textAlign: 'right',
      color: componentType === 'RECEIVER' ? 'black' : 'white',
    },
  });
