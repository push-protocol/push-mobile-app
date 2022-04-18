import React from 'react'
import { StatusBar, View, SafeAreaView, StyleSheet } from 'react-native'

import ChannelsDisplayer from 'src/components/ui/ChannelsDisplayer'

import GLOBALS from 'src/Globals'
import { useSelector } from 'react-redux'

const ChannelsScreen = () => {
  const { activeUser, users } = useSelector((state) => state.auth)

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle={'dark-content'}
        translucent
        backgroundColor="transparent"
      />

      <View style={styles.content}>
        <ChannelsDisplayer
          wallet={users[activeUser].wallet}
          pKey={users[activeUser].pkey}
        />
      </View>
    </SafeAreaView>
  )
}

// Styling
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: GLOBALS.COLORS.WHITE,
  },

  header: {
    flexDirection: 'row',
    alignSelf: 'stretch',
    alignItems: 'center',
    marginHorizontal: GLOBALS.ADJUSTMENTS.SCREEN_GAP_HORIZONTAL,
    zIndex: 99,
    height: 55,
  },
  notifier: {
    marginTop: 5,
    marginRight: 10,
  },
  settings: {
    marginTop: 5,
    width: 24,
  },
  help: {
    width: 24,
    marginTop: 5,
    marginRight: 10,
  },
  content: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
})

export default ChannelsScreen
