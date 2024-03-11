import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import GLOBALS from 'src/Globals';

import HeaderBanner from './HeaderBanner';
import {UserProfileIcon} from './UserProfile';

const ChannelsHeader = () => {
  return (
    <>
      <HeaderBanner />
      <View style={styles.container}>
        <Text style={styles.title}>Explore Channels</Text>
        <UserProfileIcon />
      </View>
    </>
  );
};

export default ChannelsHeader;

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: GLOBALS.COLORS.WHITE,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    lineHeight: 29,
  },
});
