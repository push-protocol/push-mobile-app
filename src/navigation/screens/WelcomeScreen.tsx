import {useNavigation} from '@react-navigation/native';
import React from 'react';
import GLOBALS from 'src/Globals';
import OnboardingSlider from 'src/components/misc/OnboardingSlider';

const WelcomeScreen = () => {
  const navigation = useNavigation();

  const loadNextScreen = () => {
    // @ts-ignore
    navigation.navigate(GLOBALS.SCREENS.SIGNIN);
  };

  return (
    <OnboardingSlider
      onDone={loadNextScreen}
      data={[
        {
          title: 'Your communication app for web3 & blockchain.',
          image: require('assets/ui/onboarding/ob-main.png'),
        },
        {
          title: 'Receive notifications from your favorite protocols.',
          image: require('assets/ui/onboarding/ob-notif.png'),
        },
        {
          title: 'Send and receive chats, Join vibrant communities.',
          image: require('assets/ui/onboarding/ob-chat.png'),
        },
      ]}
      footerLabel="Visit [push.org](https://push.org) to learn more about it."
    />
  );
};

export default WelcomeScreen;
