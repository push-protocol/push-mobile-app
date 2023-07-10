import {createStackNavigator} from '@react-navigation/stack';
import React from 'react';
import GLOBALS from 'src/Globals';

import SplashScreen from './screens/SplashScreen';
import VideoScreen from './screens/video/VideoScreen';

const Stack = createStackNavigator();

const InitializingNavigator = () => {
  return (
    <Stack.Navigator initialRouteName={GLOBALS.SCREENS.SPLASH}>
      <Stack.Screen
        name={GLOBALS.SCREENS.SPLASH}
        component={SplashScreen}
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
    </Stack.Navigator>
  );
};

export default InitializingNavigator;
