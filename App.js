import AsyncStorage from '@react-native-async-storage/async-storage';
import messaging from '@react-native-firebase/messaging';
import WalletConnectProvider from '@walletconnect/react-native-dapp';
import React, {useEffect} from 'react';
import 'react-native-gesture-handler';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {Provider} from 'react-redux';
import {persistStore} from 'redux-persist';
import {PersistGate} from 'redux-persist/integration/react';
import ENV_CONFIG from 'src/env.config';
import AppBadgeHelper from 'src/helpers/AppBadgeHelper';
import AppScreens from 'src/navigation';
import {NotifeeDisplayNotification} from 'src/notifee';
import store from 'src/redux';
import Notify from 'src/singletons/Notify';

import appConfig from './app.json';

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
      console.log('got token', onTokenRefresh);
      Notify.instance.saveDeviceToken(token, true); // true means it's a refresh
    });

    const handleBackgroundMessageHandler =
      messaging().setBackgroundMessageHandler(async remoteMessage => {
        await NotifeeDisplayNotification(remoteMessage);
      });

    return () => {
      onTokenRefresh;
      handleBackgroundMessageHandler;
      handleAppNotificationBadge();
    };
  }, []);

  return (
    <SafeAreaProvider>
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
            <AppScreens />
          </WalletConnectProvider>
        </PersistGate>
      </Provider>
    </SafeAreaProvider>
  );
};

export default App;
