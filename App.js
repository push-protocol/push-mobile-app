import AsyncStorage from '@react-native-async-storage/async-storage';
import messaging from '@react-native-firebase/messaging';
import WalletConnectProvider from '@walletconnect/react-native-dapp';
import React, {useEffect, useState} from 'react';
import RNCallKeep from 'react-native-callkeep';
import 'react-native-gesture-handler';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import WebviewCrypto from 'react-native-webview-crypto';
import {Provider} from 'react-redux';
import {persistStore} from 'redux-persist';
import {PersistGate} from 'redux-persist/integration/react';
import {callKeepHelper} from 'src/callkeep';
import AppBadgeHelper from 'src/helpers/AppBadgeHelper';
import AppScreens from 'src/navigation';
import store from 'src/redux';
import Notify from 'src/singletons/Notify';

import appConfig from './app.json';

let persistor = persistStore(store);

const handleAppNotificationBadge = async () => {
  await AppBadgeHelper.setAppBadgeCount(0);
};

const App = () => {
  const [callAccepted, setCallAccepted] = useState(false);

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

  RNCallKeep.setup(callKeepHelper.options);

  messaging().setBackgroundMessageHandler(async remoteMessage => {
    const caller = callKeepHelper.getCaller(remoteMessage);
    const addressTrimmed = callKeepHelper.formatEthAddress(caller);
    await RNCallKeep.displayIncomingCall(
      caller,
      addressTrimmed,
      addressTrimmed,
      'generic',
      true,
    );
  });

  useEffect(() => {
    const answerCallListener = RNCallKeep.addEventListener(
      'answerCall',
      async ({callUUID}) => {
        RNCallKeep.backToForeground();
        RNCallKeep.endCall(callUUID);
        setCallAccepted(true);
      },
    );

    return () => {
      answerCallListener;
    };
  }, []);

  return (
    <SafeAreaProvider>
      <WebviewCrypto />
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <WalletConnectProvider
            redirectUrl={
              Platform.OS === 'web'
                ? window.location.origin
                : `${appConfig.expo.scheme}://`
            }
            bridge="https://bridge.walletconnect.org"
            clientMeta={{
              description: 'Connect with WalletConnect',
              url: 'https://walletconnect.org',
              icons: ['https://walletconnect.org/walletconnect-logo.png'],
              name: 'WalletConnect',
            }}
            storageOptions={{
              asyncStorage: AsyncStorage,
            }}>
            <AppScreens callAccepted={callAccepted} />
          </WalletConnectProvider>
        </PersistGate>
      </Provider>
    </SafeAreaProvider>
  );
};

export default App;
