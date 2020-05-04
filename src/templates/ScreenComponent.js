import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
} from 'react-native';
import SafeAreaView from 'react-native-safe-area-view';

import GLOBALS from 'src/Globals';

const ComponentsScreen = ({ style }) => {
  const name = 'Harsh';

  return (
    <SafeAreaView style={[ styles.container, style ]}>
      <Image source={imageSource} />
      <Text style={styles.textStyle}>Greetings! Started with ReactNative</Text>
      <Text style={styles.subHeaderStyle}>My name is {name}</Text>
    </SafeAreaView>
  );
};

// Styling
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: GLOBALS.COLORS.WHITE,
  },
  textStyle: {
    fontSize: 45
  },
  subHeaderStyle: {
    fontSize: 20
  }
});

export default ComponentsScreen;
