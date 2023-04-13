import AsyncStorage from '@react-native-async-storage/async-storage';
import messaging from '@react-native-firebase/messaging';
import WalletConnectProvider from '@walletconnect/react-native-dapp';
import React, {useEffect} from 'react';
import {Text, Touchable, TouchableOpacity, View} from 'react-native';
import {NativeModules} from 'react-native';
import RNCallKeep from 'react-native-callkeep';
import 'react-native-gesture-handler';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import WebviewCrypto from 'react-native-webview-crypto';
import {Provider} from 'react-redux';
import {persistStore} from 'redux-persist';
import {PersistGate} from 'redux-persist/integration/react';
import AppBadgeHelper from 'src/helpers/AppBadgeHelper';
import AppScreens from 'src/navigation';
import {NotifeeDisplayNotification} from 'src/notifee';
import store from 'src/redux';
import Notify from 'src/singletons/Notify';

import appConfig from './app.json';

let persistor = persistStore(store);

const options = {
  ios: {
    appName: 'My app name',
  },
  android: {
    alertTitle: 'Permissions required',
    alertDescription: 'This application needs to access your phone accounts',
    cancelButton: 'Cancel',
    okButton: 'ok',
    imageName: 'phone_account_icon',
    // additionalPermissions: [PermissionsAndroid.PERMISSIONS.example],
    // Required to get audio in background when using Android 11
    foregroundService: {
      channelId: 'com.company.my',
      channelName: 'Foreground service for my app',
      notificationTitle: 'My app is running on background',
      notificationIcon: 'Path to the resource icon of the notification',
    },
  },
};

RNCallKeep.setup(options).then(accepted => {});

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


    // const handleBackgroundMessageHandler =
    //   messaging().setBackgroundMessageHandler(async remoteMessage => {
    //     await handleCall();
    //     await NotifeeDisplayNotification(remoteMessage);
    //   });

    return () => {
      onTokenRefresh;
      // handleBackgroundMessageHandler;
      handleAppNotificationBadge();
    };
  }, []);

  const handleCall = async () => {
    RNCallKeep.displayIncomingCall(
      'uid',
      '0x85c58...6915BE',
      'foo.eth',
      'generic',
      true,
      {
        handleType: 'generic',
        localizedCallerName: 'eoo.eth',
        foregroundColor: '#000000',
        backgroundColor: '#FFFFFF',
        notificationTitle: 'Incoming Call',
        notificationBody: 'You have a new call',
      },
    );
  };

  // const test = true;
  const test = false;

  if (test) {
    return (
      <View>
        <Text>Wola</Text>
        <TouchableOpacity
          onPress={handleCall}
          style={{backgroundColor: 'green', width: 200, margin: 50}}>
          <Text style={{padding: 20, color: 'white'}}>Do call</Text>
        </TouchableOpacity>
      </View>
    );
  }

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
            <AppScreens />
          </WalletConnectProvider>
        </PersistGate>
      </Provider>
    </SafeAreaProvider>
  );
};

export default App;
