import SpamFeed from 'src/components/ui/SpamFeed'

import React from 'react'
import { StatusBar, StyleSheet } from 'react-native'
import SafeAreaView from 'react-native-safe-area-view'

import 'src/components/ui/SpamFeed'

import GLOBALS from 'src/Globals'

const SpamBoxScreen = ({ style, route }) => {
  return (
    <SafeAreaView style={[styles.container, style]}>
      <StatusBar
        barStyle={'dark-content'}
        translucent
        backgroundColor="transparent"
      />

      <SpamFeed wallet={route.params.wallet} />
    </SafeAreaView>
  )
}

// Styling
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: GLOBALS.COLORS.WHITE,
  },
  textStyle: {
    fontSize: 45,
  },
  subHeaderStyle: {
    fontSize: 20,
  },
})

export default SpamBoxScreen
