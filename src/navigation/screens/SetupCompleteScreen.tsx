import {useNavigation} from '@react-navigation/native';
import {useRoute} from '@react-navigation/native';
import React, {useState} from 'react';
import {Image, StyleSheet, Text, View} from 'react-native';
import {useSelector} from 'react-redux';
import GLOBALS from 'src/Globals';
import OnboardingWrapper from 'src/components/misc/OnboardingWrapper';
import {usePushApi} from 'src/contexts/PushApiContext';
import {caip10ToWallet} from 'src/helpers/CAIPHelper';
import {selectUserDomain} from 'src/redux/authSlice';

import {getTrimmedAddress} from './chats/helpers/chatAddressFormatter';

const SetupCompleteScreen = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const {getReadWriteInstance} = usePushApi();
  const domain = useSelector(selectUserDomain);
  const navigation = useNavigation();
  const route = useRoute();
  // @ts-ignore
  const {user} = route.params;

  const decryptPushProfile = async () => {
    setLoading(true);
    await getReadWriteInstance();
    loadNextScreen();
    setLoading(false);
  };

  const loadNextScreen = () => {
    // @ts-ignore
    navigation.navigate(GLOBALS.SCREENS.BIOMETRIC);
  };

  return (
    <OnboardingWrapper
      backgroundColor={GLOBALS.COLORS.BG_SETUPCOMPLETE}
      title="Your Push Profile has been successfully linked."
      footerTopLabel="Skipping will let you browse with limited features. You can unlock your profile for full features later."
      footerButtons={[
        {
          title: 'Unlock Profile',
          bgColor: GLOBALS.COLORS.BLACK,
          fontColor: GLOBALS.COLORS.WHITE,
          onPress: decryptPushProfile,
          loading: loading,
        },
        {
          title: 'Skip for now',
          bgColor: GLOBALS.COLORS.TRANSPARENT,
          fontColor: GLOBALS.COLORS.BLACK,
          onPress: loadNextScreen,
        },
      ]}>
      <Image
        source={{
          uri:
            user?.profile?.picture ||
            user?.profilePicture ||
            GLOBALS.CONSTANTS.DEFAULT_PROFILE_PICTURE,
        }}
        style={styles.profilePic}
      />
      <View style={styles.addressContainer}>
        <Text style={styles.address}>
          {domain || getTrimmedAddress(caip10ToWallet(user?.wallets || ''))}
        </Text>
        <View style={styles.status} />
      </View>
    </OnboardingWrapper>
  );
};

export default SetupCompleteScreen;

const styles = StyleSheet.create({
  addressContainer: {
    alignSelf: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: GLOBALS.COLORS.BLACK,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  status: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: GLOBALS.COLORS.STATUS_YELLOW,
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
