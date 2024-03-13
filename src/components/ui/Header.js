import {useNavigation} from '@react-navigation/native';
import React from 'react';
import {StyleSheet, View} from 'react-native';
import {connect} from 'react-redux';
import GLOBALS from 'src/Globals';
import ImageButton from 'src/components/buttons/ImageButton';
import EPNSNotifierIcon from 'src/components/custom/EPNSNotifierIcon';
import {switchUser} from 'src/redux/authSlice';
import {clearFeed, fetchFeedData} from 'src/redux/feedSlice';

import HeaderBanner from './HeaderBanner';
import UserProfile from './UserProfile';

const Header = () => {
  const navigation = useNavigation();

  return (
    <>
      <HeaderBanner />
      <View style={styles.header}>
        <UserProfile icon="copy" />

        <View style={styles.headerRightContainer}>
          <EPNSNotifierIcon
            style={styles.notifier}
            iconSize={32}
            onPress={() => {
              // Refresh the feeds
              navigation.navigate(GLOBALS.SCREENS.FEED, {
                refreshNotifFeed: true,
              });

              navigation.setParams({refreshNotifFeed: true});
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
              navigation.navigate(GLOBALS.SCREENS.SETTINGS);
            }}
          />
        </View>
      </View>
    </>
  );
};

// Styling
const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignSelf: 'stretch',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: GLOBALS.ADJUSTMENTS.SCREEN_GAP_HORIZONTAL,
    zIndex: 99,
    height: GLOBALS.CONSTANTS.STATUS_BAR_HEIGHT,
    backgroundColor: GLOBALS.COLORS.WHITE,
  },
  headerRightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notifier: {
    height: GLOBALS.CONSTANTS.STATUS_BAR_HEIGHT,
  },
  settings: {
    marginLeft: 10,
    width: 24,
    height: GLOBALS.CONSTANTS.STATUS_BAR_HEIGHT,
  },
});

const mapStateToProps = state => ({
  auth: state.auth,
});

export default connect(mapStateToProps, {
  switchUser,
  fetchFeedData,
  clearFeed,
})(Header);
