import React, { useEffect, useRef } from 'react'
import { View, StyleSheet } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import SafeAreaView from 'react-native-safe-area-view'
import Constants from 'expo-constants'

import ProfileDisplayer from 'src/components/ui/ProfileDisplayer'
import EPNSNotifierIcon from 'src/components/custom/EPNSNotifierIcon'
import ImageButton from 'src/components/buttons/ImageButton'

import Notify from 'src/singletons/Notify'

import GLOBALS from 'src/Globals'

import { useDispatch, useSelector } from 'react-redux'
import {
  selectUsers,
  selectCurrentUser,
  setAuthState,
} from 'src/redux/authSlice'

const Header = ({ style }) => {
  const navigation = useNavigation()
  const users = useSelector(selectUsers)
  const currentUser = useSelector(selectCurrentUser)

  const dispatch = useDispatch()

  // Setup Refs
  const ProfileDisplayerRef = useRef(null)
  const EPNSNotifierIconRef = useRef(null)

  useEffect(() => {
    // Set Notification Listener
    Notify.instance.setNotificationListenerCallback(() => {
      onNotificationListenerUpdate()
    })
  }, [])

  // To refresh the bell badge
  const onNotificationListenerUpdate = async () => {
    // Check Notifier
    await EPNSNotifierIconRef.current.getBadgeCountAndRefresh()
  }

  return (
    <SafeAreaView style={[styles.container, style]}>
      {/* Header Comes Here */}
      <View style={styles.header}>
        <ProfileDisplayer
          ref={ProfileDisplayerRef}
          style={styles.profile}
          wallet={users[currentUser].wallet}
          lockApp={() => {
            dispatch(setAuthState(GLOBALS.AUTH_STATE.ONBOARDING))
          }}
        />

        <EPNSNotifierIcon
          ref={EPNSNotifierIconRef}
          style={styles.notifier}
          iconSize={32}
          onPress={() => {
            // Refresh the feeds
            navigation.navigate(GLOBALS.SCREENS.FEED, {
              refreshNotifFeed: true,
            })

            navigation.setParams({ refreshNotifFeed: true })
          }}
          onNewNotifications={() => {
            // Do nothing for now, bell is ringing in the module anyway
          }}
        />

        <ImageButton
          style={styles.settings}
          src={require('assets/ui/settings.png')}
          iconSize={24}
          onPress={() => {
            navigation.navigate(GLOBALS.SCREENS.SETTINGS)
          }}
        />
      </View>
    </SafeAreaView>
  )
}

// Styling
const styles = StyleSheet.create({
  container: {
    paddingTop: Constants.statusBarHeight,
    backgroundColor: GLOBALS.COLORS.WHITE,
  },
  header: {
    flexDirection: 'row',
    alignSelf: 'stretch',
    // justifyContent: "flex-end",
    alignItems: 'center',
    marginHorizontal: GLOBALS.ADJUSTMENTS.SCREEN_GAP_HORIZONTAL,
    zIndex: 99,
    height: GLOBALS.CONSTANTS.STATUS_BAR_HEIGHT,
  },
  profile: {
    borderWidth: 1,
    borderColor: 'transparent',
    height: 60,
  },
  notifier: {
    height: GLOBALS.CONSTANTS.STATUS_BAR_HEIGHT,
  },
  settings: {
    marginLeft: 10,
    width: 24,
    height: GLOBALS.CONSTANTS.STATUS_BAR_HEIGHT,
  },
})

export default Header
