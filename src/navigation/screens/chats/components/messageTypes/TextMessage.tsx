import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

import {MessageComponentType} from '../MessageComponent';

export const TextMessage = ({
  chatMessage,
  componentType,
  time,
}: {
  chatMessage: string;
  componentType: MessageComponentType;
  time: string;
}) => {
  const styles = TextStyle(componentType);
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{chatMessage}</Text>
      <Text style={styles.time}>{time}</Text>
    </View>
  );
};

export default TextMessage;

const TextStyle = (componentType: MessageComponentType) =>
  StyleSheet.create({
    container: {
      paddingHorizontal: 15,
      paddingVertical: 8,
    },
    text: {
      fontSize: 14,
      fontWeight: '400',
      lineHeight: 20,
      textAlign: 'left',
      color: componentType === 'RECEIVER' ? 'black' : 'white',
      paddingRight: 10,
    },
    time: {
      fontSize: 11,
      textAlign: 'right',
      color: componentType === 'RECEIVER' ? '#657795' : 'white',
      lineHeight: 15,
      marginTop: 5,
    },
  });
