import messaging from '@react-native-firebase/messaging';
import {useNavigation} from '@react-navigation/native';
import React from 'react';
import {Image, StyleSheet, View} from 'react-native';
import GLOBALS from 'src/Globals';
import OnboardingWrapper from 'src/components/misc/OnboardingWrapper';
import Notify from 'src/singletons/Notify';

const PushNotifyScreen = () => {
  const navigation = useNavigation();

  const enableNotifications = async () => {
    const settings = await messaging().requestPermission();
    if (settings == messaging.AuthorizationStatus.DENIED) {
      console.log('User denied permission');
      loadNextScreen();
    } else {
      loadNextScreen();
    }
  };

  const loadNextScreen = () => {
    // Save Device Token
    Notify.instance.requestDeviceToken();
    // @ts-ignore
    navigation.navigate(GLOBALS.SCREENS.GETSTARTED);
  };

  return (
    <OnboardingWrapper
      title="Receive notifications for your preferred wallet activity."
      backgroundColor={GLOBALS.COLORS.BG_PUSHNOTIFY}
      footerButtons={[
        {
          title: 'Enable Notifications',
          bgColor: GLOBALS.COLORS.BLACK,
          fontColor: GLOBALS.COLORS.WHITE,
          onPress: () => enableNotifications(),
        },
        {
          title: 'Skip for now',
          onPress: () => loadNextScreen(),
          bgColor: GLOBALS.COLORS.TRANSPARENT,
          fontColor: GLOBALS.COLORS.BLACK,
        },
      ]}>
      <View style={styles.imageContainer}>
        <Image source={require('assets/ui/notify.png')} style={styles.image} />
      </View>
    </OnboardingWrapper>
  );
};

export default PushNotifyScreen;

const styles = StyleSheet.create({
  imageContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: '80%',
    resizeMode: 'contain',
  },
});
