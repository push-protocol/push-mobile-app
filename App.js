import './web3globals.js'
import './shim.js'
import 'react-native-gesture-handler';

import { SafeAreaProvider } from 'react-native-safe-area-context';

import React, {useState} from 'react';
import { AppState, AsyncStorage } from 'react-native';

import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import SplashScreen from "src/screens/SplashScreen";

import HomeScreen from "src/screens/HomeScreen";
import SettingsScreen from "src/screens/SettingsScreen";

import WelcomeScreen from "src/screens/WelcomeScreen";
import SignInScreen from "src/screens/SignInScreen";
import BiometricScreen from "src/screens/BiometricScreen";
import PushNotifyScreen from "src/screens/PushNotifyScreen";
import SetupCompleteScreen from "src/screens/SetupCompleteScreen";

import MetaStorage from "src/singletons/MetaStorage";

import AuthContext, {APP_AUTH_STATES} from 'src/components/auth/AuthContext';
import ENV_CONFIG from 'root/env.config';
import GLOBALS from 'src/Globals';



// Assign console.log to nothing
if (ENV_CONFIG.PROD_ENV) {
  console.log = () => {};
}

// Create Stack Navigator
const Stack = createStackNavigator();

export default function App({ navigation }) {
  // AsyncStorage.clear();

  // State Settings
  // VALID APP AUTH STATES
  const [appAuthState, setAppAuthState] = useState(APP_AUTH_STATES.INITIALIZING);
  const [userWallet, setUserWallet] = useState('');
  const [userPKey, setUserPKey] = useState('');

  // Handle App State
  const handleAppStateChange = (state: any) => {
    if (state !== "active") {
      // Lock App
      // setUserWallet('');
      // setUserPKey('');
      // setAppAuthState(APP_AUTH_STATES.ONBOARDED);
    }
  }

  React.useEffect(() => {
    AppState.addEventListener('change', handleAppStateChange);

    return (() => {
      AppState.removeEventListener('change', handleAppStateChange);
    })
  }, []);

  // Handle Auth Flow
  const authContext = React.useMemo(
    () => ({
      handleAppAuthState: (newAuthState, wallet, pkey) => {
        setUserWallet(wallet);
        setUserPKey(pkey);
        setAppAuthState(newAuthState);
      },
    }),
    []
  );

  // RENDER ASSIST
  renderSelectiveScreens = () => {
    // User is Authenticated
    if (appAuthState == APP_AUTH_STATES.AUTHENTICATED) {
      return (
        <React.Fragment>
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options = {{
              headerShown: false,
            }}
            initialParams={{
              wallet: userWallet,
              pkey: userPKey
            }}
          />

          <Stack.Screen
            name="Settings"
            component={SettingsScreen}
            options = {{
              title: 'Settings',
              headerStyle: {
                backgroundColor: GLOBALS.COLORS.WHITE,
                shadowColor: GLOBALS.COLORS.TRANSPARENT,
                shadowRadius: 0,
                shadowOffset: {
                    height: 0,
                },
                elevation: 0
              },
              headerTintColor: GLOBALS.COLORS.MID_GRAY,
            }}
          />
        </React.Fragment>
      );
    }
    // User is logging in
    else if (appAuthState == APP_AUTH_STATES.ONBOARDING) {
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
          />
        </React.Fragment>
      );
    }
    // App is loading or User is getting authenticated
    else if (
      appAuthState == APP_AUTH_STATES.INITIALIZING
      || appAuthState == APP_AUTH_STATES.ONBOARDED
    ) {
      return (
        <Stack.Screen
          name="Splash"
          component={SplashScreen}
          options = {{
            headerTransparent: true,
          }}
        />
      );
    }
  }

  // RENDER
  return (
    <AuthContext.Provider value={authContext}>

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

            {renderSelectiveScreens()}

          </Stack.Navigator>

        </NavigationContainer>
      </SafeAreaProvider>

    </AuthContext.Provider>
  );

}
