import 'react-native-gesture-handler';

import { SafeAreaProvider } from 'react-native-safe-area-context';

import React, {useState} from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import SplashScreen from "src/screens/SplashScreen";
import HomeScreen from "src/screens/HomeScreen";

import WelcomeScreen from "src/screens/WelcomeScreen";
import SignInScreen from "src/screens/SignInScreen";
import BiometricScreen from "src/screens/BiometricScreen";
import PushNotifyScreen from "src/screens/PushNotifyScreen";
import SetupCompleteScreen from "src/screens/SetupCompleteScreen";

import GLOBALS from 'src/Globals';

const Stack = createStackNavigator();

export default function App() {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // RENDER ASSIST
  renderSelectiveScreens = () => {
    if (isLoading) {
      return (
        <Stack.Screen
          name="Splash"
          component={SplashScreen}
          options = {{
            headerTransparent: true,
          }}
          initialParams={{ setIsSignedIn, setIsLoading }}
        />
      );
    }
    else {
      if (!isSignedIn) {
        return (
          <React.Fragment>
            <Stack.Screen
              name="Welcome"
              component={WelcomeScreen}
              options = {{
                headerShown: false,
                headerTintColor: GLOBALS.COLORS.MID_GRAY,
              }}
            />

            <Stack.Screen
              name="SignIn"
              component={SignInScreen}
              options = {{
                headerShown: false,
                headerTintColor: GLOBALS.COLORS.MID_GRAY,
              }}
            />

            <Stack.Screen
              name="Biometric"
              component={BiometricScreen}
              options = {{
                headerShown: false,
                headerTintColor: GLOBALS.COLORS.MID_GRAY,
              }}
            />

            <Stack.Screen
              name="PushNotify"
              component={PushNotifyScreen}
              options = {{
                headerShown: false,
                headerTintColor: GLOBALS.COLORS.MID_GRAY,
              }}
            />

            <Stack.Screen
              name="SetupComplete"
              component={SetupCompleteScreen}
              options = {{
                headerShown: false,
                headerTintColor: GLOBALS.COLORS.MID_GRAY,
              }}
              initialParams={{ setIsSignedIn, setIsLoading }}
            />
          </React.Fragment>
        );
      }
      else {
        return (
          <Stack.Screen
            name="Home"
            component={HomeScreen}
          />
        );
      }
    }
  }


  // RENDER
  return (
    <SafeAreaProvider>
      <NavigationContainer>

        <Stack.Navigator
          screenOptions = {{
            title: '',
            headerStyle: {
              backgroundColor: GLOBALS.COLORS.WHITE,
              shadowColor: 'transparent',
              shadowRadius: 0,
              shadowOffset: {
                  height: 0,
              },
              elevation: 0
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

          {
            renderSelectiveScreens()
          }

        </Stack.Navigator>

      </NavigationContainer>
  </SafeAreaProvider>
  );
}
