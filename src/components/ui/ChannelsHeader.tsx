import {useNavigation} from '@react-navigation/native';
import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import GLOBALS from 'src/Globals';

import HeaderBanner from './HeaderBanner';
import {UserProfileIcon} from './UserProfile';

const ChannelsHeader = () => {
  const navigation = useNavigation();

  const navigateToSettings = () => {
    // @ts-ignore
    navigation.navigate(GLOBALS.SCREENS.SETTINGS);
  };

  return (
    <>
      <HeaderBanner />
      <View style={styles.container}>
        <Text style={styles.title}>Explore Channels</Text>
        <Pressable onPress={navigateToSettings}>
          <UserProfileIcon />
        </Pressable>
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
