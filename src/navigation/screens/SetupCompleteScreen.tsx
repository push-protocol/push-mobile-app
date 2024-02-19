import {useNavigation} from '@react-navigation/native';
import React from 'react';
import {ActivityIndicator, Image, StyleSheet, Text, View} from 'react-native';
import {useSelector} from 'react-redux';
import GLOBALS from 'src/Globals';
import OnboardingWrapper from 'src/components/misc/OnboardingWrapper';
import {usePushApi} from 'src/contexts/PushApiContext';
import {caip10ToWallet} from 'src/helpers/CAIPHelper';
import {selectUserDomain} from 'src/redux/authSlice';

import {getTrimmedAddress} from './chats/helpers/chatAddressFormatter';

const SetupCompleteScreen = () => {
  const {userInfo, getReadWriteInstance} = usePushApi();
  const domain = useSelector(selectUserDomain);
  const navigation = useNavigation();

  const decryptPushProfile = async () => {
    await getReadWriteInstance();
    loadNextScreen();
  };

  const loadNextScreen = () => {
    // @ts-ignore
    navigation.navigate(GLOBALS.SCREENS.BIOMETRIC);
  };

  return (
    <OnboardingWrapper
      title="Your Push profile has been successfully linked."
      footerTopLabel="Skipping will let you browse with limited features. You can unlock your profile for full features later."
      footerButtons={[
        {
          title: 'Unlock Profile',
          bgColor: GLOBALS.COLORS.PINK,
          fontColor: GLOBALS.COLORS.WHITE,
          onPress: decryptPushProfile,
          disabled: !userInfo,
        },
        {
          title: 'Skip for now',
          bgColor: GLOBALS.COLORS.TRANSPARENT,
          fontColor: GLOBALS.COLORS.BLACK,
          onPress: loadNextScreen,
          disabled: !userInfo,
        },
      ]}>
      {userInfo ? (
        <>
          <Image
            source={{
              uri:
                userInfo.profile.picture ||
                GLOBALS.CONSTANTS.DEFAULT_PROFILE_PICTURE,
            }}
            style={styles.profilePic}
          />
          <View style={styles.addressContainer}>
            <Text style={styles.address}>
              {domain ||
                getTrimmedAddress(caip10ToWallet(userInfo?.wallets || ''))}
            </Text>
          </View>
        </>
      ) : (
        <ActivityIndicator
          size={'large'}
          color={GLOBALS.COLORS.BLACK}
          style={styles.loader}
        />
      )}
    </OnboardingWrapper>
  );
};

export default SetupCompleteScreen;

const styles = StyleSheet.create({
  addressContainer: {
    alignSelf: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: GLOBALS.COLORS.PINK,
    borderRadius: 24,
  },
  address: {
    color: GLOBALS.COLORS.WHITE,
    fontSize: 14,
  },
  profilePic: {
    alignSelf: 'center',
    marginBottom: 24,
    marginTop: 48,
    width: 96,
    height: 96,
    borderRadius: 48,
  },
  loader: {
    marginTop: 48,
  },
});
