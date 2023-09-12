import {WalletConnectModal} from '@walletconnect/modal-react-native';
import '@walletconnect/react-native-compat';
import React from 'react';
import 'react-native-gesture-handler';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import WebviewCrypto from 'react-native-webview-crypto';
import {Provider} from 'react-redux';
import {persistStore} from 'redux-persist';
import {PersistGate} from 'redux-persist/integration/react';
import VideoCallContextProvider from 'src/contexts/VideoContext';
import AppScreens from 'src/navigation';
import {useNotification} from 'src/push_video/hooks/useNotification';
import store from 'src/redux';
import {WalletConnectConfig} from 'src/walletconnect';

import appConfig from './app.json';

let persistor = persistStore(store);

const App = ({isCallAccepted}) => {
  const {numBgCallAccepted} = useNotification();

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
