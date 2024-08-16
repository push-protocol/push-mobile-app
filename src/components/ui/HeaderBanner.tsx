import {useWalletConnectModal} from '@walletconnect/modal-react-native';
import Constants from 'expo-constants';
import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import GLOBALS from 'src/Globals';
import {usePushApi} from 'src/contexts/PushApiContext';
import {usePushApiMode} from 'src/hooks/pushapi/usePushApiMode';

import PrimaryButton from '../buttons/PrimaryButton';

const HeaderBanner = () => {
  let {isLoading, getReadWriteInstance} = usePushApi();
  const {open} = useWalletConnectModal();
  const {isGreenStatus, isSignerEnabled} = usePushApiMode();

  const unlockProfile = async () => {
    if (isSignerEnabled) {
      await getReadWriteInstance();
    } else {
      await open();
      await getReadWriteInstance();
    }
  };

  return (
    <View
      style={[
        styles.container,
        (isLoading || isGreenStatus) && styles.noBanner,
      ]}>
      {!isLoading && !isGreenStatus && (
        <View style={styles.bannerContainer}>
          <View style={styles.bannerLeftContainer}>
            <View style={styles.bannerStatusIcon} />
            <Text style={styles.bannerText}>
              You are browsing in read only mode. Access more features by
              unlocking your profile.
            </Text>
          </View>
          <PrimaryButton
            title="Unlock Profile"
            fontSize={12}
            fontColor={GLOBALS.COLORS.WHITE}
            bgColor={GLOBALS.COLORS.BLACK}
            onPress={unlockProfile}
          />
        </View>
      )}
    </View>
  );
};

export default HeaderBanner;

const styles = StyleSheet.create({
  container: {
    backgroundColor: GLOBALS.COLORS.WHITE,
  },
  noBanner: {
    paddingTop: Constants.statusBarHeight,
  },
  bannerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: GLOBALS.COLORS.STATUS_YELLOW_BG,
    padding: 16,
    // top: -Constants.statusBarHeight,
    paddingTop: 16 + Constants.statusBarHeight,
  },
  bannerLeftContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  bannerStatusIcon: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: GLOBALS.COLORS.STATUS_YELLOW,
    marginRight: 10,
    marginTop: 2,
  },
  bannerText: {
    fontSize: 12,
    fontWeight: '500',
    maxWidth: 213,
    lineHeight: 18,
  },
});
