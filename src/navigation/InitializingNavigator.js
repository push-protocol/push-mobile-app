import {createStackNavigator} from '@react-navigation/stack';
import React from 'react';
import GLOBALS from 'src/Globals';

import SplashScreen from './screens/SplashScreen';

const Stack = createStackNavigator();

const InitializingNavigator = () => {
  console.log('InitializingNavigator - I should not be called');
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
    </Stack.Navigator>
  );
};

export default InitializingNavigator;
