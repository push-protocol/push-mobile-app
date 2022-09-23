import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

const Time = ({text}: {text: string}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{text}</Text>
    </View>
  );
};

export default Time;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    textAlign: 'center',
    marginBottom: 10,
  },
  text: {
    fontSize: 13,
    color: '#6F829E',
    fontWeight: '400',
    marginBottom: 5,
    textAlign: 'center',
  },
});
