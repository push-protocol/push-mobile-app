import {createStackNavigator} from '@react-navigation/stack';
import Constants from 'expo-constants';
import React from 'react';
import GLOBALS from 'src/Globals';
import Header from 'src/components/ui/Header';
import Tabs from 'src/components/ui/Tabs';
import QRScanScreen from 'src/navigation/screens/dapp/QRScanScreen';

import ChatProfileScreen from './screens/ChatProfileScreen';
import PgpFromPkScreen from './screens/PgpFromPkScreen';
import SettingsScreen from './screens/SettingsScreen';
import SignInFromDapp from './screens/SignInFromDapp';
import {SingleChatScreen} from './screens/chats';

const Stack = createStackNavigator();

export default function AuthenticatedNavigator() {
  return (
    <Stack.Navigator
      initialRouteName={GLOBALS.SCREENS.TABS}
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
        name={GLOBALS.SCREENS.TABS}
        component={Tabs}
        options={{
          statusBar: {
            backgroundColor: 'white',
            style: 'dark',
          },
          header: () => <Header />,
        }}
      />

      <Stack.Screen
        name={GLOBALS.SCREENS.SETTINGS}
        component={SettingsScreen}
        options={{
          title: 'Settings',
          headerStyle: {
            backgroundColor: GLOBALS.COLORS.WHITE,
            height:
              Constants.statusBarHeight + GLOBALS.CONSTANTS.STATUS_BAR_HEIGHT,
          },
          headerTintColor: GLOBALS.COLORS.MID_GRAY,
        }}
      />

      <Stack.Screen
        name={GLOBALS.SCREENS.SINGLE_CHAT}
        component={SingleChatScreen}
        // options={{
        //   title: 'Chat',
        //   headerStyle: {
        //     backgroundColor: GLOBALS.COLORS.WHITE,
        //     height:
        //       Constants.statusBarHeight + GLOBALS.CONSTANTS.STATUS_BAR_HEIGHT,
        //   },
        //   headerTintColor: GLOBALS.COLORS.MID_GRAY,
        // }}
        options={{
          headerShown: false,
          headerTintColor: GLOBALS.COLORS.MID_GRAY,
        }}
      />

      <Stack.Screen
        name={GLOBALS.SCREENS.PGP_FROM_PK_SCREEN}
        component={PgpFromPkScreen}
        options={{
          title: 'PgpFromPkScreen',
          headerStyle: {
            backgroundColor: GLOBALS.COLORS.WHITE,
            height:
              Constants.statusBarHeight + GLOBALS.CONSTANTS.STATUS_BAR_HEIGHT,
          },
          headerTintColor: GLOBALS.COLORS.MID_GRAY,
        }}
      />
      <Stack.Screen
        name={GLOBALS.SCREENS.CHATPROFILESCREEN}
        component={ChatProfileScreen}
        options={{
          title: 'Setting UP Chat Profile',
          headerStyle: {
            backgroundColor: GLOBALS.COLORS.WHITE,
            height:
              Constants.statusBarHeight + GLOBALS.CONSTANTS.STATUS_BAR_HEIGHT,
          },
          headerTintColor: GLOBALS.COLORS.MID_GRAY,
        }}
      />
      <Stack.Screen
        name={GLOBALS.SCREENS.QRScanScreenFromLogin}
        component={QRScanScreen}
        options={{
          headerShown: false,
          headerTintColor: GLOBALS.COLORS.MID_GRAY,
        }}
      />
      <Stack.Screen
        name={GLOBALS.SCREENS.SIGNINFROMDAPP}
        component={SignInFromDapp}
        options={{
          headerShown: false,
          headerTintColor: GLOBALS.COLORS.MID_GRAY,
        }}
      />
    </Stack.Navigator>
  );
}
