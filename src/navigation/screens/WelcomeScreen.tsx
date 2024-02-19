import {useNavigation} from '@react-navigation/native';
import React from 'react';
import {Animated, Image, StyleSheet} from 'react-native';
import GLOBALS from 'src/Globals';
import OnboardingWrapper from 'src/components/misc/OnboardingWrapper';

const WelcomeScreen = () => {
  const navigation = useNavigation();

  const loadNextScreen = () => {
    // @ts-ignore
    navigation.navigate(GLOBALS.SCREENS.SIGNIN);
  };

  return (
    <OnboardingWrapper
      title="Your communication app for web3 & blockchain"
      footerLabel="Visit [push.org](https://push.org) to learn more about it."
      footerButtons={[
        {
          title: 'Continue',
          fontColor: GLOBALS.COLORS.WHITE,
          bgColor: GLOBALS.COLORS.GRADIENT_THIRD,
          onPress: loadNextScreen,
        },
      ]}>
      <Animated.View style={styles.logo}>
        <Image source={require('assets/ui/fulllogo.png')} />
      </Animated.View>
    </OnboardingWrapper>
  );
};

export default WelcomeScreen;

const styles = StyleSheet.create({
  logo: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
});
