import React from 'react'

import { createStackNavigator } from '@react-navigation/stack'

import Header from 'src/components/ui/Header'
import Tabs from 'src/components/ui/Tabs'

import SettingsScreen from './screens/SettingsScreen'

import GLOBALS from 'src/Globals'
import Constants from 'expo-constants'

const Stack = createStackNavigator()

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
      }}
    >
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
    </Stack.Navigator>
  )
}
