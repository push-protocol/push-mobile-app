import './shim.js'

import 'react-native-gesture-handler'

import React, { useEffect } from 'react'
import{Text,View} from 'react-native';

import { SafeAreaProvider } from 'react-native-safe-area-context'
import WalletConnectProvider from '@walletconnect/react-native-dapp'
import AsyncStorage from '@react-native-async-storage/async-storage'
import ENV_CONFIG from 'src/env.config'

import AppBadgeHelper from 'src/helpers/AppBadgeHelper'
import messaging from '@react-native-firebase/messaging'
import { PersistGate } from 'redux-persist/integration/react'
import { persistStore } from 'redux-persist'

import { Provider } from 'react-redux';
import store from 'src/redux';
import AppScreens from 'src/navigation'


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
