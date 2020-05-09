import { registerRootComponent } from 'expo';
import React, { useEffect, useCallback } from 'react';
import { AppRegistry } from 'react-native';

import messaging from '@react-native-firebase/messaging';
import Notifications from 'src/singletons/Notifications';

import App from './App';

// Register background handler
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('Message handled in the background!', remoteMessage);
  console.log('BACKGROUND', JSON.stringify(remoteMessage));
  Notifications.instance.handleIncomingPushAppInBG(remoteMessage);
});

function HeadlessCheck({ isHeadless }) {
  useEffect(
    React.useCallback(()=>{
      (async()=>{
        console.log("registration", await messaging().registerDeviceForRemoteMessages());
      })()
    })
  )

  if (isHeadless) {
    // App has been launched in the background by iOS, ignore
    return null;
  }

  return <App />;
}

AppRegistry.registerComponent('main', () => HeadlessCheck);

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in the Expo client or in a native build,
// the environment is set up appropriately
// registerRootComponent(App);
