import messaging from '@react-native-firebase/messaging';
import React, {useEffect} from 'react';
import {AppRegistry} from 'react-native';
import RNCallKeep from 'react-native-callkeep';
import 'react-native-crypto';
import 'react-native-get-random-values';
import WebviewCrypto from 'react-native-webview-crypto';
import {NotifeClearBadge, NotifeeDisplayNotification} from 'src/notifee';
import 'text-encoding';

import App from './App';
import {name as appName} from './app.json';
import './shim';

const options = {
  ios: {
    appName: 'My app name',
  },
  android: {
    alertTitle: 'Permissions required',
    alertDescription: 'This application needs to access your phone accounts',
    cancelButton: 'Cancel',
    okButton: 'ok',
    imageName: 'phone_account_icon',
    // additionalPermissions: [PermissionsAndroid.PERMISSIONS.example],
    // Required to get audio in background when using Android 11
    foregroundService: {
      channelId: 'com.company.my',
      channelName: 'Foreground service for my app',
      notificationTitle: 'My app is running on background',
      notificationIcon: 'Path to the resource icon of the notification',
    },
  },
};

const handleCall = async () => {
  RNCallKeep.displayIncomingCall(
    'uid',
    '0x85c58...6915BE',
    'foo.eth',
    'generic',
    true,
    {
      handleType: 'generic',
      localizedCallerName: 'eoo.eth',
      foregroundColor: '#000000',
      backgroundColor: '#FFFFFF',
      notificationTitle: 'Incoming Call',
      notificationBody: 'You have a new call',
    },
  );
};

// FIREBASE
// Register background handler
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('I was called');
  await handleCall();
  // await NotifeeDisplayNotification(remoteMessage);
});

function HeadlessCheck({isHeadless}) {
  useEffect(() => {
    NotifeClearBadge();
  }, []);

  RNCallKeep.setup(options).then(accepted => {});

  if (isHeadless) {
    // App has been launched in the background by iOS, ignore
    return null;
  }

  return <App />;
}

AppRegistry.registerComponent(appName, () => HeadlessCheck);
AppRegistry.registerHeadlessTask(
  'RNCallKeepBackgroundMessage',
  () =>
    ({name, callUUID, handle}) => {
      // Make your call here

      return Promise.resolve();
    },
);
