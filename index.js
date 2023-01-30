import messaging from '@react-native-firebase/messaging';
import React, {useEffect} from 'react';
import {AppRegistry} from 'react-native';
import {NotifeClearBadge, NotifeeDisplayNotification} from 'src/notifee';
import 'text-encoding';

import App from './App';
import {name as appName} from './app.json';
import './shim';

// FIREBASE
// Register background handler
messaging().setBackgroundMessageHandler(async remoteMessage => {
  await NotifeeDisplayNotification(remoteMessage);
});

function HeadlessCheck({isHeadless}) {
  useEffect(() => {
    NotifeClearBadge();
  }, []);

  if (isHeadless) {
    // App has been launched in the background by iOS, ignore
    return null;
  }

  return <App />;
}

AppRegistry.registerComponent(appName, () => HeadlessCheck);
