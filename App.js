import './shim.js';

import 'react-native-gesture-handler';

import React, { useEffect } from 'react';

import AsyncStorage from '@react-native-async-storage/async-storage';
import WalletConnectProvider from '@walletconnect/react-native-dapp';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import ENV_CONFIG from 'src/env.config';

import { persistStore } from 'redux-persist';
import { PersistGate } from 'redux-persist/integration/react';
import AppBadgeHelper from 'src/helpers/AppBadgeHelper';

import { Provider } from 'react-redux';
import AppScreens from 'src/navigation';
import store from 'src/redux';
import Video from 'react-native-video';
import YouTube from 'react-native-youtube';


let persistor = persistStore(store)

const App = () => {
  const handleAppNotificationBadge = async () => {
    await AppBadgeHelper.setAppBadgeCount(0)
  }

  // TODO: Add notification codes here
  useEffect(()=>{
  },[])

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
            }}
          >
            {/* <Text>I was called</Text> */}
            <AppScreens />
          </WalletConnectProvider>
        </PersistGate>
      </Provider>
    </SafeAreaProvider>
  );
};


export default App;
