import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';

import GLOBALS from 'src/Globals';

import BiometricScreen from './screens/BiometricScreen';
import SignInScreen from './screens/SignInScreen';
import NewWalletSignInScreen from './screens/NewWalletSignInScreen';
import WelcomeScreen from './screens/WelcomeScreen';
import PushNotifyScreen from './screens/PushNotifyScreen';
import SetupCompleteScreen from './screens/SetupCompleteScreen';
import {View, Text} from 'react-native';

const Stack = createStackNavigator();

const OnboardingNavigator = () => {
  console.log('rendering now');
  return (
    <Stack.Navigator
      initialRouteName={GLOBALS.SCREENS.WELCOME}
      screenOptions={{
        title: '',
        headerStyle: {
          backgroundColor: GLOBALS.COLORS.WHITE,
          shadowColor: 'transparent',
          shadowRadius: 0,
          shadowOffset: {
            height: 0,
          },
          elevation: 0,
        },
        headerTitleStyle: {
          color: GLOBALS.COLORS.BLACK,
        },
        headerBackTitleStyle: {
          color: GLOBALS.COLORS.PRIMARY,
        },
        headerTintColor: GLOBALS.COLORS.BLACK,
        headerTitleAlign: 'center',
        headerBackTitleVisible: false,
      }}>
      <Stack.Screen
        name={GLOBALS.SCREENS.WELCOME}
        component={WelcomeScreen}
        options={{
          headerShown: false,
          headerTintColor: GLOBALS.COLORS.MID_GRAY,
        }}
      />

      <Stack.Screen name={GLOBALS.SCREENS.SIGNIN} component={SignInScreen} />

      <Stack.Screen
        name={GLOBALS.SCREENS.NEWWALLETSIGNIN}
        component={NewWalletSignInScreen}
      />

      <Stack.Screen
        name={GLOBALS.SCREENS.BIOMETRIC}
        component={BiometricScreen}
        options={{
          headerShown: false,
          headerTintColor: GLOBALS.COLORS.MID_GRAY,
        }}
      />

      <Stack.Screen
        name={GLOBALS.SCREENS.PUSHNOTIFY}
        component={PushNotifyScreen}
        options={{
          headerShown: false,
          headerTintColor: GLOBALS.COLORS.MID_GRAY,
        }}
      />

      <Stack.Screen
        name={GLOBALS.SCREENS.SETUPCOMPLETE}
        component={SetupCompleteScreen}
        options={{
          headerShown: false,
          headerTintColor: GLOBALS.COLORS.MID_GRAY,
        }}
      />
    </Stack.Navigator>
  );
};

export default OnboardingNavigator;
