import messaging from '@react-native-firebase/messaging';
import React, {useEffect} from 'react';
import {AppRegistry} from 'react-native';
import RNCallKeep from 'react-native-callkeep';
import 'react-native-crypto';
import 'react-native-get-random-values';
import WebviewCrypto from 'react-native-webview-crypto';
import {callKeepHelper} from 'src/callkeep';
import {NotifeClearBadge} from 'src/notifee';
import 'text-encoding';

import App from './App';
import {name as appName} from './app.json';
import './shim';

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

RNCallKeep.setup(callKeepHelper.options);
RNCallKeep.setAvailable(true);

messaging().setBackgroundMessageHandler(async remoteMessage => {
  RNCallKeep.setup(callKeepHelper.options);
  RNCallKeep.setAvailable(true);

  const caller = callKeepHelper.getCaller(remoteMessage);
  const addressTrimmed = callKeepHelper.formatEthAddress(caller);
  RNCallKeep.displayIncomingCall(
    caller,
    addressTrimmed,
    addressTrimmed,
    'generic',
    true,
  );
});

AppRegistry.registerComponent(appName, () => HeadlessCheck);
AppRegistry.registerHeadlessTask(
  'RNCallKeepBackgroundMessage',
  () =>
    ({name, callUUID, handle}) => {
      return Promise.resolve();
    },
);
