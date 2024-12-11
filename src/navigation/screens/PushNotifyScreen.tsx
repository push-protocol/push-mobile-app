import messaging from '@react-native-firebase/messaging';
import {useNavigation} from '@react-navigation/native';
import React from 'react';
import {Image, StyleSheet, View} from 'react-native';
import {PermissionsAndroid, Platform} from 'react-native';
import GLOBALS from 'src/Globals';
import {ToasterOptions} from 'src/components/indicators/Toaster';
import OnboardingWrapper from 'src/components/misc/OnboardingWrapper';
import {useToaster} from 'src/contexts/ToasterContext';
import Notify from 'src/singletons/Notify';

const PushNotifyScreen = () => {
  const navigation = useNavigation();
  const {toastRef} = useToaster();

  const enableNotifications = async () => {
    if (Platform.OS === 'android') {
      const res = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      );
      if (res == PermissionsAndroid.RESULTS.GRANTED) {
        loadNextScreen();
      } else {
        showToast();
      }
    } else {
      const settings = await messaging().requestPermission({
        sound: true,
        alert: true,
        badge: true,
      });
      if (settings == messaging.AuthorizationStatus.AUTHORIZED) {
        loadNextScreen();
      } else {
        showToast();
      }
    }
  };

  const loadNextScreen = () => {
    // Save Device Token
    Notify.instance.requestDeviceToken();
    // @ts-ignore
    navigation.navigate(GLOBALS.SCREENS.GETSTARTED);
  };

  const showToast = () => {
    toastRef.current?.showToast(
      'Notifications are disabled. \nYou can enable them in your device settings.',
      '',
      ToasterOptions.TYPE.GRADIENT_PRIMARY,
    );
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
