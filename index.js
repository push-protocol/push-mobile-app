import { registerRootComponent } from 'expo';
import { AppRegistry } from 'react-native';

import messaging from '@react-native-firebase/messaging';
import Notifications from 'src/singletons/Notifications';

import App from './App';

// Register background handler
messaging().setBackgroundMessageHandler(async remoteMessage => {
  Notifications.instance.handleIncomingPushAppInBG(remoteMessage);
});

function HeadlessCheck({ isHeadless }) {
  if (isHeadless) {
    // App has been launched in the background by iOS, ignore
    return null;
  }

  return <App />;
}

AppRegistry.registerComponent('app', () => HeadlessCheck);

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in the Expo client or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
