import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import Globals from 'src/Globals';

import {ChatMessage} from '../helpers/chatResolver';

const Sender = ({message, time, messageType}: ChatMessage) => {
  // console.log('got message type', messageType, 'message was', message);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.text}>{message}</Text>
      </View>

      <Text style={styles.time}>{time}</Text>
    </View>
  );
};

export default Sender;

const styles = StyleSheet.create({
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
