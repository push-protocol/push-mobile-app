import React, {useEffect} from 'react';
import {AppRegistry} from 'react-native';
import 'react-native-crypto';
import 'react-native-get-random-values';
import WebviewCrypto from 'react-native-webview-crypto';
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

AppRegistry.registerComponent(appName, () => HeadlessCheck);
AppRegistry.registerHeadlessTask(
  'RNCallKeepBackgroundMessage',
  () =>
    ({name, callUUID, handle}) => {
      return Promise.resolve();
    },
);
