import {VideoCallStatus} from '@pushprotocol/restapi';
import messaging from '@react-native-firebase/messaging';
import {WalletConnectModal} from '@walletconnect/modal-react-native';
import '@walletconnect/react-native-compat';
import React, {useContext, useEffect, useState} from 'react';
import RNCallKeep from 'react-native-callkeep';
import 'react-native-gesture-handler';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import VoipPushNotification from 'react-native-voip-push-notification';
import WebviewCrypto from 'react-native-webview-crypto';
import {Provider} from 'react-redux';
import {persistStore} from 'redux-persist';
import {PersistGate} from 'redux-persist/integration/react';
import VideoCallContextProvider from 'src/contexts/VideoContext';
import {VideoCallContext} from 'src/contexts/VideoContext';
import AppBadgeHelper from 'src/helpers/AppBadgeHelper';
import AppScreens from 'src/navigation';
import {getCallInfoFromServer} from 'src/navigation/screens/video/helpers/useVideoSocket';
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
  const {incomingCall, acceptRequestWrapper} = useContext(VideoCallContext);
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

  // this is supposed to be called when app is at bg
  // android only
  // useEffect(() => {
  //   RNCallKeep.addEventListener('answerCall', async ({callUUID}) => {
  //     RNCallKeep.backToForeground();
  //     RNCallKeep.endCall(callUUID);
  //     MetaStorage.instance.setBackgroundCallAccepted(false);
  //     setNumBgCallAccepted(prev => prev + 1);
  //   });
  // }, []);

  useEffect(() => {
    VoipPushNotification.addEventListener('register', token => {
      console.log('Registering APN token:', token);
      // setAPN(token);
    });

    VoipPushNotification.addEventListener('notification', notification => {
      const {status, uuid} = notification;
      //  as {
      //   callerName: string;
      //   details: {title: string; body: string};
      //   status: number;
      //   uuid: string;
      // };
      console.log('notification', notification);
      console.log('status', status);
      if (status === VideoCallStatus.INITIALIZED) {
        console.log('Status is INITIALIZED');
        const incomingCallAnswer = async ({callUUID}) => {
          console.log('incomingCallAnswer');
          // updateCallStatus({
          // callerInfo,
          // type: 'ACCEPTED',
          // });
          // navigation.navigate(SCREEN_NAMES.Meeting, {
          // name: 'Person B',
          // token: videoSDKInfo.token,
          // meetingId: videoSDKInfo.meetingId,
          // });
          const [success, videoMeta] = await getCallInfoFromServer(
            connectedUser.wallet,
          );
          console.log('success', success);
          if (success) {
            await incomingCall(videoMeta, false);
            acceptRequestWrapper({
              senderAddress: videoMeta.recipientAddress,
              recipientAddress: videoMeta.senderAddress,
              chatId: videoMeta.chatId,
              signalData: videoMeta.signalData,
            });

            MetaStorage.instance.setBackgroundCallAccepted(true);
            // @ts-ignore
            // navigation.navigate(GLOBALS.SCREENS.VIDEOCALL);
            console.log('need to navigate to the video screen from here');
          }
        };
        const endIncomingCall = () => {
          console.log('Incoming Call Declined');
          CallkeepHelper.endAllCall();
          // updateCallStatus({callerInfo, type: 'REJECTED'});
        };
        CallkeepHelper.configure(incomingCallAnswer, endIncomingCall);
      } else if (status === VideoCallStatus.DISCONNECTED) {
        CallkeepHelper.endAllCall();
      }
      VoipPushNotification.onVoipNotificationCompleted(uuid);
    });

    VoipPushNotification.addEventListener('didLoadWithEvents', events => {
      if (events.length < 2) {
        return;
      }
      console.log('events:', JSON.stringify(events));
      const {callerInfo, videoSDKInfo, status} = events[1].data;
      console.log('VoipPushNotification', events[1].data);
      if (status === VideoCallStatus.INITIALIZED) {
        const incomingCallAnswer = async ({callUUID}) => {
          console.log('incomingCallAnswer inside didLoadWithEvents');
          // updateCallStatus({
          // callerInfo,
          // type: 'ACCEPTED',
          // });
          // navigation.navigate(SCREEN_NAMES.Meeting, {
          //   name: 'Person B',
          //   token: videoSDKInfo.token,
          //   meetingId: videoSDKInfo.meetingId,
          // });
          const [success, videoMeta] = await getCallInfoFromServer(
            connectedUser.wallet,
          );
          if (success) {
            await incomingCall(videoMeta, false);
            acceptRequestWrapper({
              senderAddress: videoMeta.recipientAddress,
              recipientAddress: videoMeta.senderAddress,
              chatId: videoMeta.chatId,
              signalData: videoMeta.signalData,
            });

            MetaStorage.instance.setBackgroundCallAccepted(true);
            // @ts-ignore
            // navigation.navigate(GLOBALS.SCREENS.VIDEOCALL);
            console.log('need to navigate to the video screen from here');
          }
        };

        const endIncomingCall = () => {
          CallkeepHelper.endAllCall();
          // updateCallStatus({callerInfo, type: 'REJECTED'});
        };

        CallkeepHelper.configure(incomingCallAnswer, endIncomingCall);
      }
    });

    // console.log('Registering VoIP token');
    VoipPushNotification.registerVoipToken();

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
