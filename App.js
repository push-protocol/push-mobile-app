import './web3globals.js'
import './shim.js'

import 'react-native-gesture-handler'

import React, { useEffect } from 'react'

import messaging from '@react-native-firebase/messaging'

import WalletConnectProvider from '@walletconnect/react-native-dapp'
import AsyncStorage from '@react-native-async-storage/async-storage'

import AppScreens from 'src/navigation'
import { SafeAreaProvider } from 'react-native-safe-area-context'

import AppBadgeHelper from 'src/helpers/AppBadgeHelper'
import Notify from 'src/singletons/Notify'

import ENV_CONFIG from 'src/env.config'

import { Provider } from 'react-redux'
import store from 'src/redux'
import { persistStore } from 'redux-persist'
import { PersistGate } from 'redux-persist/integration/react'

// Assign console.log to nothing
if (!ENV_CONFIG.SHOW_CONSOLE) {
  console.log('Production Environment... disabling console!')
}

let persistor = persistStore(store)

export default function App() {
  const handleAppNotificationBadge = async () => {
    await AppBadgeHelper.setAppBadgeCount(0)
  }

  // HANDLE ON APP START
  useEffect(() => {
    // PUSH NOTIFICATIONS HANDLING
    // Request Device Token and save it user is signed in
    Notify.instance.requestDeviceToken(true)

    // Listen to whether the token changes
    const onTokenRefresh = messaging().onTokenRefresh((token) => {
      Notify.instance.saveDeviceToken(token, true) // true means it's a refresh
    })

    // Listen for incoming messages
    const handleForegroundPush = messaging().onMessage(
      async (remoteMessage) => {
        Notify.instance.handleIncomingPushAppOpened(remoteMessage)
      },
    )

    messaging().onNotificationOpenedApp((remoteMessage) => {
      Notify.instance.triggerNotificationListenerCallback()
    })

    messaging()
      .getInitialNotification()
      .then((remoteMessage) => {
        if (remoteMessage) {
          Notify.instance.triggerNotificationListenerCallback()
        }
      })

    return () => {
      onTokenRefresh
      handleForegroundPush
      handleAppNotificationBadge()
    }
  }, [])

  // RENDER
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
            <AppScreens />
          </WalletConnectProvider>
        </PersistGate>
      </Provider>
    </SafeAreaProvider>
  )
}
