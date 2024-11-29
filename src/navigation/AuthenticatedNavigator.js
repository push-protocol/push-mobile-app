import {createStackNavigator} from '@react-navigation/stack';
import Constants from 'expo-constants';
import React, {useEffect} from 'react';
import GLOBALS from 'src/Globals';
import Header from 'src/components/ui/Header';
import Tabs from 'src/components/ui/Tabs';
import {NotificationHelper} from 'src/helpers/NotificationHelper';
import QRScanScreen from 'src/navigation/screens/dapp/QRScanScreen';

import ChatProfileScreen from './screens/ChatProfileScreen';
import PgpFromPkScreen from './screens/PgpFromPkScreen';
import {SingleChatScreen} from './screens/chats';
import CreateGroup from './screens/chats/CreateGroup';
import GroupInfo from './screens/chats/GroupInfo';
import {NewChatScreen} from './screens/chats/NewChatScreen';
import VideoScreen from './screens/video/VideoScreen';

const Stack = createStackNavigator();

export default function AuthenticatedNavigator() {
  /************************************************/
  /**   Handle native notification and notifee   **/
  /**        events(onPress and dismiss)         **/
  /************************************************/
  useEffect(() => {
    NotificationHelper.handleNotificationEvents();
  }, []);

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
          headerShown: false,
        }}
      />

      <Stack.Screen
        name={GLOBALS.SCREENS.SINGLE_CHAT}
        component={SingleChatScreen}
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
        name={GLOBALS.SCREENS.NewChatScreen}
        component={NewChatScreen}
        options={{
          headerShown: false,
          headerTintColor: GLOBALS.COLORS.MID_GRAY,
        }}
      />

      <Stack.Screen
        name={GLOBALS.SCREENS.VIDEOCALL}
        component={VideoScreen}
        options={{
          headerShown: false,
          headerTintColor: GLOBALS.COLORS.MID_GRAY,
        }}
      />

      <Stack.Screen
        name={GLOBALS.SCREENS.GROUP_INFO}
        component={GroupInfo}
        options={{
          headerShown: false,
          headerTintColor: GLOBALS.COLORS.MID_GRAY,
        }}
      />

      <Stack.Screen
        name={GLOBALS.SCREENS.CREATE_GROUP}
        component={CreateGroup}
        options={{
          headerShown: false,
          headerTintColor: GLOBALS.COLORS.MID_GRAY,
        }}
      />
    </Stack.Navigator>
  );
}
