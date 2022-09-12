import './shim.js';
import 'react-native-gesture-handler';

import React, {useEffect} from 'react';
import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';
import WalletConnectProvider from '@walletconnect/react-native-dapp';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import ENV_CONFIG from 'src/env.config';

import {persistStore} from 'redux-persist';
import {PersistGate} from 'redux-persist/integration/react';
import AppBadgeHelper from 'src/helpers/AppBadgeHelper';
import Notify from 'src/singletons/Notify';

import {Provider} from 'react-redux';
import AppScreens from 'src/navigation';
import store from 'src/redux';

let persistor = persistStore(store);

const App = () => {
  const handleAppNotificationBadge = async () => {
    await AppBadgeHelper.setAppBadgeCount(0);
  };

  useEffect(() => {
    // PUSH NOTIFICATIONS HANDLING
    // Request Device Token and save it user is signed in
    Notify.instance.requestDeviceToken(true);

    // Listen to whether the token changes
    const onTokenRefresh = messaging().onTokenRefresh(token => {
      Notify.instance.saveDeviceToken(token, true); // true means it's a refresh
    });

    // Listen for incoming messages
    const handleForegroundPush = messaging().onMessage(async remoteMessage => {
      Notify.instance.handleIncomingPushAppOpened(remoteMessage);
    });

    messaging().onNotificationOpenedApp(remoteMessage => {
      Notify.instance.triggerNotificationListenerCallback();
    });

    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          Notify.instance.triggerNotificationListenerCallback();
        }
      });

    return () => {
      onTokenRefresh;
      handleForegroundPush;
      handleAppNotificationBadge();
    };
  }, []);

  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <WalletConnectProvider
            redirectUrl={`${ENV_CONFIG.DEEPLINK_URL}`}
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
            {/* <Text>I was called</Text> */}
            <AppScreens />
          </WalletConnectProvider>
        </PersistGate>
      </Provider>
    </SafeAreaProvider>
  );
};

export default App;
