import 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import GLOBALS from 'src/Globals';

import HomeScreen from "src/screens/HomeScreen";

const Stack = createStackNavigator();

export default function App() {
  // RENDER
  return (
    <SafeAreaProvider>
      <NavigationContainer>

        <Stack.Navigator
          initialRouteName = "Home"
          screenOptions = {{
            headerStyle: {
              backgroundColor: GLOBALS.COLORS.WHITE,
            },
            headerTitleStyle: {
              color: GLOBALS.COLORS.BLACK
            },
            headerBackTitleStyle: {
              color: GLOBALS.COLORS.PRIMARY
            },
            headerTintColor: GLOBALS.COLORS.BLACK,
            headerTitleAlign: 'center',
            headerBackTitleVisible: false,
          }}
        >

          <Stack.Screen
            name = "Home"
            component = {HomeScreen}
            options = {{
              headerShown: true,
              title: 'EPNS',
              headerStyle: {
                backgroundColor: 'transparent',
              },
              headerTintColor: 'transparent',
            }}
          />

        </Stack.Navigator>

      </NavigationContainer>
  </SafeAreaProvider>
  );
}
