import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import Globals from 'src/Globals';

import {ChatMessage} from '../helpers/chatResolver';

const Recipient = ({message, time}: ChatMessage) => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.text}>{message}</Text>
      </View>

      <Text style={styles.time}>{time}</Text>
    </View>
  );
};

export default Recipient;

const styles = StyleSheet.create({
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
