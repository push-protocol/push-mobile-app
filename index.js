import React from 'react'
import { AppRegistry } from 'react-native'

import messaging from '@react-native-firebase/messaging'
import Notify from 'src/singletons/Notify'

import App from './App'
import { Provider } from 'react-redux'
import store from 'src/redux-store'

// Register background handler
messaging().setBackgroundMessageHandler(async (remoteMessage) => {
  return new Promise(async (resolve, reject) => {
    //console.log('Message handled in the background!', remoteMessage);
    await Notify.instance.handleIncomingPushAppInBG(remoteMessage)

    resolve(true)
  })
})

function HeadlessCheck({ isHeadless }) {
  if (isHeadless) {
    // App has been launched in the background by iOS, ignore
    return null
  }

  return (
    <Provider store={store}>
      <App />
    </Provider>
  )
}

AppRegistry.registerComponent('main', () => HeadlessCheck)
