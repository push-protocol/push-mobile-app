import React from 'react';
import {StatusBar, StyleSheet, View} from 'react-native';
import GLOBALS from 'src/Globals';
import SpamFeed from 'src/components/ui/SpamFeed';
import 'src/components/ui/SpamFeed';

const SpamBoxScreen = () => {
  return (
    <View style={styles.container}>
      <StatusBar
        barStyle={'dark-content'}
        translucent
        backgroundColor="transparent"
      />

      <SpamFeed />
    </View>
  );
};

// Styling
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: GLOBALS.COLORS.WHITE,
  },
  textStyle: {
    fontSize: 45,
  },
  subHeaderStyle: {
    fontSize: 20,
  },
});

export default SpamBoxScreen;
