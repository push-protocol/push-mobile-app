import AsyncStorage from '@react-native-async-storage/async-storage';
import messaging from '@react-native-firebase/messaging';
import WalletConnectProvider from '@walletconnect/react-native-dapp';
import React, {useEffect, useState} from 'react';
import {Text, TouchableOpacity, View} from 'react-native';
import RNCallKeep from 'react-native-callkeep';
import 'react-native-gesture-handler';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import WebviewCrypto from 'react-native-webview-crypto';
import {Provider} from 'react-redux';
import {persistStore} from 'redux-persist';
import {PersistGate} from 'redux-persist/integration/react';
import AppBadgeHelper from 'src/helpers/AppBadgeHelper';
import AppScreens from 'src/navigation';
import {VideoScreenApp} from 'src/push_video/VideoScreen';
import store from 'src/redux';
import Notify from 'src/singletons/Notify';

import appConfig from './app.json';

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

const getCaller = jsonObj => {
  try {
    const bodyStr = jsonObj.notification.body;
    const regex = /0x[\w]+/;
    const match = bodyStr.match(regex);
    return match[0];
  } catch (error) {
    console.log('got err', error);
  }
  return 'abishek';
};
let persistor = persistStore(store);

const App = () => {
  const handleAppNotificationBadge = async () => {
    await AppBadgeHelper.setAppBadgeCount(0);
  };

  useEffect(() => {
    // PUSH NOTIFICATIONS HANDLING
    Notify.instance.requestDeviceToken(true);

    // Listen to whether the token changes
    const onTokenRefresh = messaging().onTokenRefresh(token => {
      Notify.instance.saveDeviceToken(token, true); // true means it's a refresh
    });

    return () => {
      onTokenRefresh;
      // handleBackgroundMessageHandler;
      handleAppNotificationBadge();
    };
  }, []);

  const [callAccepted, setCallAccepted] = useState(false);

  const [test, setTest] = useState(false);
  const [connectedUser, setSonnectedUser] = useState('');
  const [senderAddress, setSenderAddress] = useState('');

  RNCallKeep.setup(options);

  // FIREBASE
  messaging().setBackgroundMessageHandler(async remoteMessage => {
    console.log('remote message ', remoteMessage);
    try {
      const caller = getCaller(remoteMessage);
      console.log('got caller', caller);
      await RNCallKeep.displayIncomingCall(
        caller,
        '0x85c58...6915BE',
        'foo.eth',
        'generic',
        true,
      );
    } catch (e) {
      console.log('err', e);
    }
  });

  RNCallKeep.addEventListener('answerCall', async ({callUUID}) => {
    try {
      console.log('call3');
      RNCallKeep.backToForeground();
      RNCallKeep.endCall(callUUID);
      setSenderAddress(callUUID);
      setCallAccepted(true);
      // setTest(true);
    } catch (error) {
      console.log('eer', error);
    }
  });

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
