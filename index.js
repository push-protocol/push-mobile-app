import messaging from '@react-native-firebase/messaging';
import React, {useEffect} from 'react';
import {Alert, AppRegistry, AppState, Platform} from 'react-native';
import RNCallKeep from 'react-native-callkeep';
import 'react-native-crypto';
import 'react-native-get-random-values';
import CallKeepHelper from 'src/helpers/CallkeepHelper';
import {NotificationHelper} from 'src/helpers/NotificationHelper';
import {NotifeClearBadge} from 'src/notifee';
import {getUUID} from 'src/push_video/payloads/helpers';
import MetaStorage from 'src/singletons/MetaStorage';
import 'text-encoding';
import {stringify} from 'uuid';

import App from './App';
import {name as appName} from './app.json';
import './shim';

let isCallAccepted = false;

// this is supposed to be called wiz
if (AppState.currentState !== 'active' && Platform.OS === 'android') {
  RNCallKeep.addEventListener('answerCall', async ({callUUID}) => {
    CallKeepHelper.backToForeground();
    CallKeepHelper.endAllCall();
    isCallAccepted = true;
    MetaStorage.instance.setBackgroundCallAccepted(false);
  });
  RNCallKeep.addEventListener('endCall', async ({callUUID}) => {
    CallKeepHelper.endAllCall();
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

// --------------------------------------
// Uncomment the code below if the video call feature is enabled.
// --------------------------------------
// if (Platform.OS === 'android') {
// CallKeepHelper.setupCallKeep();
// RNCallKeep.setAvailable(true);
// }

/************************************************/
/**     Listeners used to display notifee      **/
/**          and native notification           **/
/************************************************/
messaging().setBackgroundMessageHandler(async remoteMessage => {
  // console.log('Message handled in the background!', remoteMessage);
  /***************************************************/
  /** Uncomment below commented code if video call  **/
  /**       feature is enabled in the app           **/
  /***************************************************/
  // if (Platform.OS === 'android' && CallKeepHelper.isVideoCall(remoteMessage)) {
  //   const caller = CallKeepHelper.getCaller(remoteMessage);
  //   const addressTrimmed = CallKeepHelper.formatEthAddress(caller);
  //   const uuid = getUUID();
  //   RNCallKeep.displayIncomingCall(
  //     uuid,
  //     addressTrimmed,
  //     addressTrimmed,
  //     'generic',
  //     true,
  //   );
  // }
});

messaging().onMessage(async remoteMessage => {
  // console.log('Message handled in the foreground!', remoteMessage);
  if (remoteMessage.notification) {
    await NotificationHelper.resolveNotification(remoteMessage);
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
