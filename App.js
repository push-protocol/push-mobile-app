import messaging from '@react-native-firebase/messaging';
import {WalletConnectModal} from '@walletconnect/modal-react-native';
import '@walletconnect/react-native-compat';
import React, {useEffect, useState} from 'react';
import RNCallKeep from 'react-native-callkeep';
import 'react-native-gesture-handler';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import WebviewCrypto from 'react-native-webview-crypto';
import {Provider} from 'react-redux';
import {persistStore} from 'redux-persist';
import {PersistGate} from 'redux-persist/integration/react';
import VideoCallContextProvider from 'src/contexts/VideoContext';
import AppBadgeHelper from 'src/helpers/AppBadgeHelper';
import AppScreens from 'src/navigation';
import store from 'src/redux';
import Notify from 'src/singletons/Notify';
import {WalletConnectConfig} from 'src/walletconnect';

import appConfig from './app.json';

let persistor = persistStore(store);

const handleAppNotificationBadge = async () => {
  await AppBadgeHelper.setAppBadgeCount(0);
};

const App = ({isCallAccepted}) => {
  const [isCallLocal, setCallAccepted] = useState(false);
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

  // useEffect(() => {
  //   RNCallKeep.addEventListener('answerCall', async ({callUUID}) => {
  //     RNCallKeep.backToForeground();
  //     RNCallKeep.endCall(callUUID);
  //     setCallAccepted(true);
  //   });
  // }, []);

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
          {/* <VideoCallContextProvider> */}
          <AppScreens callAccepted={isCallLocal || isCallAccepted} />
          {/* </VideoCallContextProvider> */}
        </PersistGate>
      </Provider>
    </SafeAreaProvider>
  );
};

export default App;
