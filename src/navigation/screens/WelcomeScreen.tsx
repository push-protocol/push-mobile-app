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
          title: 'Your communication super app for web3 & blockchain.',
          image: require('assets/ui/onboarding/ob-main.json'),
        },
        {
          title: 'Subscribe to receive notifications from your favorite apps.',
          image: require('assets/ui/onboarding/ob-notif.json'),
        },
        {
          title: 'Chat with any wallet. Join vibrant communities.',
          image: require('assets/ui/onboarding/ob-chat.json'),
        },
      ]}
      footerLabel="Visit [push.org](https://push.org) to learn more about it."
    />
  );
};

export default WelcomeScreen;
