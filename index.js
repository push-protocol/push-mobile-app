import messaging from '@react-native-firebase/messaging';
import React from 'react';
import {AppRegistry} from 'react-native';
import {NotifeeDisplayNotification} from 'src/notifee';

import App from './App';
import {name as appName} from './app.json';

// FIREBASE
// Register background handler
messaging().setBackgroundMessageHandler(async remoteMessage => {
  await NotifeeDisplayNotification(remoteMessage);
});

function HeadlessCheck({isHeadless}) {
  if (isHeadless) {
    // App has been launched in the background by iOS, ignore
    return null;
  }

  return <App />;
}

AppRegistry.registerComponent(appName, () => HeadlessCheck);
