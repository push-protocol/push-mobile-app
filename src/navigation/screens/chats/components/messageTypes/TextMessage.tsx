import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import Globals from 'src/Globals';

import {ChatMessage} from '../../helpers/chatResolver';
import {MessageComponentType} from '../MessageComponent';

export const TextMessage = ({
  chatMessage,
  componentType,
  time,
}: {
  chatMessage: ChatMessage;
  componentType: MessageComponentType;
  time: string;
}) => {
  const styles = TextStyle(componentType);
  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.text}>{chatMessage.message}</Text>
        <Text style={styles.time}>{time}</Text>
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
      minWidth: '35%',
      maxWidth: '75%',
      borderTopLeftRadius: componentType === 'RECEIVER' ? 0 : 15,
      borderTopRightRadius: componentType === 'RECEIVER' ? 15 : 0,
      borderBottomRightRadius: 15,
      borderBottomLeftRadius: 20,
      color: Globals.COLORS.BLACK,
    },
    text: {
      paddingHorizontal: 20,
      paddingTop: 16,
      fontSize: 14,
      fontWeight: '400',
      marginBottom: 8,
      lineHeight: 20,
      textAlign: 'left',
      color: componentType === 'RECEIVER' ? 'black' : 'white',
    },
    time: {
      fontSize: 11,
      textAlign: 'right',
      color: componentType === 'RECEIVER' ? '#657795' : 'white',
      paddingBottom: 8,
      paddingHorizontal: 10,
    },
  });
