import {VideoCallStatus} from '@pushprotocol/restapi';
import messaging from '@react-native-firebase/messaging';
import {WalletConnectModal} from '@walletconnect/modal-react-native';
import '@walletconnect/react-native-compat';
import React, {useCallback, useEffect, useState} from 'react';
import {Platform} from 'react-native';
import RNCallKeep from 'react-native-callkeep';
import 'react-native-gesture-handler';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import VoipPushNotification from 'react-native-voip-push-notification';
import WebviewCrypto from 'react-native-webview-crypto';
import {Provider} from 'react-redux';
import {persistStore} from 'redux-persist';
import {PersistGate} from 'redux-persist/integration/react';
import VideoCallContextProvider from 'src/contexts/VideoContext';
import AppBadgeHelper from 'src/helpers/AppBadgeHelper';
import AppScreens from 'src/navigation';
import store from 'src/redux';
import MetaStorage from 'src/singletons/MetaStorage';
import Notify from 'src/singletons/Notify';
import {WalletConnectConfig} from 'src/walletconnect';

import appConfig from './app.json';
import CallkeepHelper from './src/callkeep';

let persistor = persistStore(store);

const handleAppNotificationBadge = async () => {
  await AppBadgeHelper.setAppBadgeCount(0);
};

const App = ({isCallAccepted}) => {
  const [numBgCallAccepted, setNumBgCallAccepted] = useState(0);
  useEffect(() => {
    // PUSH NOTIFICATIONS HANDLING
    Notify.instance.requestDeviceToken(true);

    // Listen to whether the token changes
    const onTokenRefresh = messaging().onTokenRefresh(token => {
      Notify.instance.saveDeviceToken(token, true); // true means it's a refresh
    });

    return () => {
      onTokenRefresh;
      handleAppNotificationBadge();
    };
  }, []);

  const answerIncomingCall = useCallback(() => {
    MetaStorage.instance.setBackgroundCallAccepted(false);
    setNumBgCallAccepted(prev => prev + 1);
  }, []);

  const endIncomingCall = useCallback(() => {
    CallkeepHelper.endAllCall();
  }, []);

  // this is supposed to be called when app is at bg
  // android only
  useEffect(() => {
    RNCallKeep.addEventListener('answerCall', async ({callUUID}) => {
      if (Platform.OS === 'android') {
        CallkeepHelper.backToForeground();
        CallkeepHelper.endAllCall();
      }
      answerIncomingCall();
    });

    RNCallKeep.addEventListener('endCall', async ({callUUID}) => {
      endIncomingCall();
    });

    RNCallKeep.addEventListener('didLoadWithEvents', events => {
      console.log('didLoadWithEvents', events);
      const answerCallEvent = events.find(
        event => event.name === 'RNCallKeepPerformAnswerCallAction',
      );
      console.log('answerCallEvent', answerCallEvent);
      if (answerCallEvent) {
        answerIncomingCall();
      }
    });
  }, []);

  useEffect(() => {
    VoipPushNotification.addEventListener('register', token => {
      console.log('Registering APN token:', token);
    });

    VoipPushNotification.addEventListener('notification', notification => {
      const {status, uuid} = notification;
      if (status === VideoCallStatus.INITIALIZED) {
        CallkeepHelper.configure(answerIncomingCall, endIncomingCall);
      } else if (status === VideoCallStatus.DISCONNECTED) {
        endIncomingCall();
      }
      VoipPushNotification.onVoipNotificationCompleted(uuid);
    });

    VoipPushNotification.addEventListener('didLoadWithEvents', events => {
      // If loaded with notification received events
      if (events.length >= 2) {
        console.log('events:', JSON.stringify(events));
        const status = events[0].data?.status || events[1].data?.status;
        const uuid = events[0].data?.uuid || events[1].data?.uuid;
        if (status === VideoCallStatus.INITIALIZED) {
          CallkeepHelper.configure(answerIncomingCall, endIncomingCall);
        } else if (status === VideoCallStatus.DISCONNECTED) {
          endIncomingCall();
        }
        VoipPushNotification.onVoipNotificationCompleted(uuid);
      }
    });

    // console.log('Registering VoIP token');
    Platform.OS === 'ios' && VoipPushNotification.registerVoipToken();

    return () => {
      VoipPushNotification.removeEventListener('didLoadWithEvents');
      VoipPushNotification.removeEventListener('register');
      VoipPushNotification.removeEventListener('notification');
    };
  }, []);

  return (
    <SafeAreaProvider>
      <WebviewCrypto />
      <WalletConnectModal
        projectId={WalletConnectConfig.projectId}
        providerMetadata={WalletConnectConfig.providerMetadata(
          `${appConfig.expo.scheme}://`,
        )}
        sessionParams={WalletConnectConfig.sessionParams}
        relayUrl="wss://relay.walletconnect.com"
      />
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <VideoCallContextProvider>
            <AppScreens callAccepted={numBgCallAccepted || isCallAccepted} />
          </VideoCallContextProvider>
        </PersistGate>
      </Provider>
    </SafeAreaProvider>
  );
};

export default App;
