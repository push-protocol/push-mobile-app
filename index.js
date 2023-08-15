import messaging from '@react-native-firebase/messaging';
import React, {useEffect} from 'react';
import {AppRegistry} from 'react-native';
import {AppState} from 'react-native';
import RNCallKeep from 'react-native-callkeep';
import 'react-native-crypto';
import 'react-native-get-random-values';
import {callKeepHelper} from 'src/callkeep';
import {NotifeClearBadge} from 'src/notifee';
import {getUUID} from 'src/push_video/payloads/helpers';
import MetaStorage from 'src/singletons/MetaStorage';
import 'text-encoding';

import App from './App';
import {name as appName} from './app.json';
import './shim';

let isCallAccepted = false;

// this is supposed to be called wiz
if (AppState.currentState !== 'active') {
  RNCallKeep.addEventListener('answerCall', async ({callUUID}) => {
    RNCallKeep.backToForeground();
    RNCallKeep.endCall(callUUID);
    isCallAccepted = true;
    MetaStorage.instance.setBackgroundCallAccepted(false);
  });
}

function HeadlessCheck({isHeadless}) {
  useEffect(() => {
    NotifeClearBadge();
  }, []);

  if (isHeadless) {
    // App has been launched in the background by iOS, ignore
    return null;
  }

  return <App isCallAccepted={isCallAccepted} />;
}

RNCallKeep.setup(callKeepHelper.options);
RNCallKeep.setAvailable(true);

messaging().setBackgroundMessageHandler(async remoteMessage => {
  if (callKeepHelper.isVideoCall(remoteMessage)) {
    RNCallKeep.setup(callKeepHelper.options);
    RNCallKeep.setAvailable(true);

    const caller = callKeepHelper.getCaller(remoteMessage);
    const addressTrimmed = callKeepHelper.formatEthAddress(caller);
    const uuid = getUUID();
    RNCallKeep.displayIncomingCall(
      uuid,
      addressTrimmed,
      addressTrimmed,
      'generic',
      true,
    );
  }
});

if (isCallAccepted) {
  AppRegistry.registerComponent(appName, () => HeadlessCheck);
} else {
  AppRegistry.registerComponent(appName, () => HeadlessCheck);
}

AppRegistry.registerHeadlessTask(
  'RNCallKeepBackgroundMessage',
  () => bgCalling,
);
