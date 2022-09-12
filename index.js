import React from 'react';
import App from './App';

import messaging from '@react-native-firebase/messaging';
import Notify from 'src/singletons/Notify';

import {AppRegistry} from 'react-native';
import {name as appName} from './app.json';

// FIREBASE
// Register background handler
messaging().setBackgroundMessageHandler(async remoteMessage => {
  return new Promise(async (resolve, reject) => {
    await Notify.instance.handleIncomingPushAppInBG(remoteMessage);
    resolve(true);
  });
});

function HeadlessCheck({isHeadless}) {
  if (isHeadless) {
    // App has been launched in the background by iOS, ignore
    return null;
  }

  return <App />;
}

AppRegistry.registerComponent(appName, () => HeadlessCheck);
