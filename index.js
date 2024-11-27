import notifee, {EventType} from '@notifee/react-native';
import messaging from '@react-native-firebase/messaging';
import React, {useEffect} from 'react';
import {AppRegistry, Platform} from 'react-native';
import {AppState} from 'react-native';
import RNCallKeep from 'react-native-callkeep';
import 'react-native-crypto';
import 'react-native-get-random-values';
import CallKeepHelper from 'src/helpers/CallkeepHelper';
import {NotificationHelper} from 'src/helpers/NotificationHelper';
import {NotifeClearBadge} from 'src/notifee';
import {getUUID} from 'src/push_video/payloads/helpers';
import MetaStorage from 'src/singletons/MetaStorage';
import 'text-encoding';

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
  console.log('Message handled in the background!', remoteMessage);

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
  console.log('Message handled in the foreground!', remoteMessage);
  await NotificationHelper.resolveNotification(remoteMessage);
});

/************************************************/
/**   Handle native notification and notifee   **/
/**        events(onPress and dismiss)         **/
/************************************************/
messaging()
  .getInitialNotification()
  .then(async remoteMessage => {
    if (remoteMessage) {
      console.log(
        'Notification caused app to open from quit state:',
        remoteMessage.notification,
      );
      await NotificationHelper.handleNotificationRoute(
        remoteMessage.notification?.data?.type,
      );
    }
  });

messaging().onNotificationOpenedApp(async remoteMessage => {
  console.log(
    'Notification caused app to open from background state:',
    JSON.stringify({remoteMessage}),
  );
  await NotificationHelper.handleNotificationRoute(
    remoteMessage.notification?.data?.type,
  );
});

notifee.onForegroundEvent(async ({type, detail}) => {
  console.log('notifee.onForegroundEvent', JSON.stringify({type, detail}));
  if (type === EventType.PRESS) {
    await NotificationHelper.handleNotificationRoute(
      detail.notification?.data?.type,
    );
  }
});

notifee.onBackgroundEvent(async ({type, detail}) => {
  console.log('notifee.onBackgroundEvent', JSON.stringify({type, detail}));
  if (type === EventType.PRESS) {
    await NotificationHelper.handleNotificationRoute(
      detail.notification?.data?.type,
    );
  }
});

// NotificationHelper.handleChatNotification();

if (isCallAccepted) {
  AppRegistry.registerComponent(appName, () => HeadlessCheck);
} else {
  AppRegistry.registerComponent(appName, () => HeadlessCheck);
}

AppRegistry.registerHeadlessTask(
  'RNCallKeepBackgroundMessage',
  () => bgCalling,
);
