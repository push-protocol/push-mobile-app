import React from 'react';
import {SafeAreaView, StatusBar, StyleSheet, View} from 'react-native';
import GLOBALS from 'src/Globals';
import ChannelsDisplayer from 'src/components/ui/ChannelsDisplayer';
import ChannelsHeader from 'src/components/ui/ChannelsHeader';

const ChannelsScreen = () => {
  return (
    <>
      <SafeAreaView style={styles.container}>
        <StatusBar
          barStyle={'dark-content'}
          translucent
          backgroundColor="transparent"
        />
        <ChannelsHeader />
        <ChannelsDisplayer />
      </SafeAreaView>
    </>
  );
};

// Styling
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: GLOBALS.COLORS.WHITE,
  },

  header: {
    flexDirection: 'row',
    alignSelf: 'stretch',
    alignItems: 'center',
    marginHorizontal: GLOBALS.ADJUSTMENTS.SCREEN_GAP_HORIZONTAL,
    zIndex: 99,
    height: 55,
  },
  notifier: {
    marginTop: 5,
    marginRight: 10,
  },
  settings: {
    marginTop: 5,
    width: 24,
  },
  help: {
    width: 24,
    marginTop: 5,
    marginRight: 10,
  },
});

export default ChannelsScreen;
