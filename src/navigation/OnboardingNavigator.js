import {createStackNavigator} from '@react-navigation/stack';
import React from 'react';
import GLOBALS from 'src/Globals';

import BiometricScreen from './screens/BiometricScreen';
import GetStartedScreen from './screens/GetStartedScreen';
import PushNotifyScreen from './screens/PushNotifyScreen';
import SetupCompleteScreen from './screens/SetupCompleteScreen';
import SignInScreen from './screens/SignInScreen';
import SignInAdvanceScreen from './screens/SignInScreenAdvance';
import SignInScreenWallet from './screens/SignInScreenWallet';
import WelcomeScreen from './screens/WelcomeScreen';
import QRScanScreen from './screens/dapp/QRScanScreen';

const Stack = createStackNavigator();

const OnboardingNavigator = () => {
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

      <Stack.Screen
        name={GLOBALS.SCREENS.SIGNIN}
        component={SignInScreen}
        options={{
          headerShown: false,
          headerTintColor: GLOBALS.COLORS.MID_GRAY,
        }}
      />

      <Stack.Screen
        name={GLOBALS.SCREENS.SIGNINADVANCE}
        component={SignInAdvanceScreen}
        options={{
          headerShown: false,
          headerTintColor: GLOBALS.COLORS.MID_GRAY,
        }}
      />

      <Stack.Screen
        name={GLOBALS.SCREENS.SIGNINWALLET}
        component={SignInScreenWallet}
        options={{
          headerShown: false,
          headerTintColor: GLOBALS.COLORS.MID_GRAY,
        }}
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
        name={GLOBALS.SCREENS.GETSTARTED}
        component={GetStartedScreen}
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

      <Stack.Screen
        name={GLOBALS.SCREENS.QRScanScreen}
        component={QRScanScreen}
        options={{
          headerShown: false,
          headerTintColor: GLOBALS.COLORS.MID_GRAY,
        }}
      />
    </Stack.Navigator>
  );
};

export default OnboardingNavigator;
