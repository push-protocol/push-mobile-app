import {useNavigation} from '@react-navigation/native';
import {useWalletConnectModal} from '@walletconnect/modal-react-native';
import Constants from 'expo-constants';
import React, {useEffect, useState} from 'react';
import {
  Animated,
  Dimensions,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {connect} from 'react-redux';
import GLOBALS from 'src/Globals';
import ImageButton from 'src/components/buttons/ImageButton';
import PrimaryButton from 'src/components/buttons/PrimaryButton';
import EPNSNotifierIcon from 'src/components/custom/EPNSNotifierIcon';
import StylishLabel from 'src/components/labels/StylishLabel';
import {usePushApi} from 'src/contexts/PushApiContext';
import {selectCurrentUser, selectUsers, setLogout} from 'src/redux/authSlice';
import {switchUser} from 'src/redux/authSlice';
import {clearFeed, fetchFeedData} from 'src/redux/feedSlice';
import Notify from 'src/singletons/Notify';

import UserProfile from './UserProfile';

getProperAddressLabel = (wallet, ens, cns) => ens || cns || wallet;

const Header = ({switchUser, setParams, fetchFeedData, style}) => {
  const navigation = useNavigation();
  const users = useSelector(selectUsers);
  const currentUser = useSelector(selectCurrentUser);
  const dispatch = useDispatch();
  let {getReadWriteInstance, readOnlyMode, isLoading} = usePushApi();
  const {open, isConnected} = useWalletConnectModal();

  // To refresh the bell badge
  const onNotificationListenerUpdate = async () => {
    // Check Notifier
    await EPNSNotifierIconRef.current.getBadgeCountAndRefresh();
  };

  useEffect(() => {
    // Set Notification Listener
    Notify.instance.setNotificationListenerCallback(() => {
      onNotificationListenerUpdate();
    });
  }, []);

  const [show, setShow] = useState(false);
  const [fader] = useState(new Animated.Value(0));

  const toggleShow = () => {
    setShow(prev => !prev);

    // Start animation
    if (!show) {
      // Fade In
      Animated.timing(fader, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    } else {
      // Fade Out
      Animated.timing(fader, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
  };

  const lockApp = () => {
    dispatch(setLogout(null));
  };

  const unlockProfile = async () => {
    if (isConnected) {
      await getReadWriteInstance();
    } else {
      await open();
      await getReadWriteInstance();
    }
  };

  return (
    <View
      style={[
        styles.container,
        (isLoading || !readOnlyMode) && styles.noBanner,
        style,
      ]}>
      {/* Header Comes Here */}
      {!isLoading && readOnlyMode && (
        <View style={styles.bannerContainer}>
          <View style={styles.bannerLeftContainer}>
            <View style={styles.bannerStatusIcon} />
            <Text style={styles.bannerText}>
              You are browsing in read only mode. Access more features by
              unlocking your profile.
            </Text>
          </View>
          <PrimaryButton
            title="Unlock Profile"
            fontSize={12}
            fontColor={GLOBALS.COLORS.WHITE}
            bgColor={GLOBALS.COLORS.BLACK}
            onPress={unlockProfile}
          />
        </View>
      )}
      <View>
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

        {show && (
          <Animated.View
            style={[
              styles.activeProfile,
              platfromSpecificStyle,
              {opacity: fader},
            ]}
            pointerEvents="box-none">
            <View style={styles.upArrow} />
            <View style={styles.content}>
              {users.map(({wallet, index, ens, cns}) => {
                let isActive = currentUser === index;

                const onPress = () => {
                  switchUser(index);
                  navigation.navigate(GLOBALS.SCREENS.FEED, {
                    refreshNotifFeed: true,
                  });
                  navigation.setParams({refreshNotifFeed: true});
                  clearFeed(null);
                  fetchFeedData({
                    rewrite: true,
                    wallet,
                  });
                  setCurrentUserWallet(users[index]);
                  toggleShow();
                };

                return isActive ? (
                  <TouchableOpacity
                    style={styles.activeWalletInfo}
                    key={wallet}>
                    <StylishLabel
                      style={styles.para}
                      fontSize={16}
                      title="[t:Connected Wallet]"
                    />
                    <Text style={styles.activeWalletText}>
                      {getProperAddressLabel(wallet, ens, cns)}
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity style={styles.walletInfo} onPress={onPress}>
                    <Text style={styles.walletText}>
                      {getProperAddressLabel(wallet, ens, cns)}
                    </Text>
                  </TouchableOpacity>
                );
              })}

              <View style={{}}>
                <PrimaryButton
                  iconFactory="Ionicons"
                  icon=""
                  iconSize={24}
                  title="Lock App"
                  fontSize={16}
                  fontColor={GLOBALS.COLORS.WHITE}
                  bgColor={GLOBALS.COLORS.GRADIENT_PRIMARY}
                  onPress={() => {
                    toggleShow();
                    lockApp();
                  }}
                />
              </View>
            </View>
          </Animated.View>
        )}
      </View>
    </View>
  );
};

// Styling
const styles = StyleSheet.create({
  container: {
    backgroundColor: GLOBALS.COLORS.WHITE,
  },
  noBanner: {
    paddingTop: Constants.statusBarHeight,
  },
  header: {
    flexDirection: 'row',
    alignSelf: 'stretch',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: GLOBALS.ADJUSTMENTS.SCREEN_GAP_HORIZONTAL,
    zIndex: 99,
    height: GLOBALS.CONSTANTS.STATUS_BAR_HEIGHT,
  },
  headerRightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
  content: {
    marginTop: GLOBALS.ADJUSTMENTS.SCREEN_GAP_VERTICAL,
    marginBottom: GLOBALS.ADJUSTMENTS.SCREEN_GAP_VERTICAL,
    marginHorizontal: GLOBALS.ADJUSTMENTS.SCREEN_GAP_HORIZONTAL,
  },
  activeProfile: {
    // position: 'absolute',
    width: Math.round(Dimensions.get('window').width) - 75,
    backgroundColor: GLOBALS.COLORS.WHITE,
    // top: 70,
    left: 36,
    borderRadius: 10,
    shadowColor: GLOBALS.COLORS.BLACK,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,

    elevation: 10,
    zIndex: 2,
    maxWidth: 500,
  },
  activeWalletInfo: {
    padding: 10,
    backgroundColor: GLOBALS.COLORS.LIGHT_GRAY,
    borderRadius: GLOBALS.ADJUSTMENTS.DEFAULT_MID_RADIUS,
    marginBottom: 10,
  },
  activeWalletIos: {
    position: 'absolute',
    top: 70,
    left: 20,
  },
  walletInfo: {
    padding: 10,
    backgroundColor: GLOBALS.COLORS.DARK_BLACK_TRANS,
    borderRadius: GLOBALS.ADJUSTMENTS.DEFAULT_MID_RADIUS,
    marginBottom: 10,
  },
  walletText: {
    marginTop: 10,
    color: GLOBALS.COLORS.WHITE,
    marginBottom: 5,
  },
  activeWalletText: {
    marginTop: 10,
    color: GLOBALS.COLORS.DARKER_GRAY,
    marginBottom: 5,
  },
  upArrow: {
    position: 'absolute',
    top: -8,
    left: 3,
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderBottomWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: GLOBALS.COLORS.WHITE,
  },
  bannerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: GLOBALS.COLORS.STATUS_YELLOW_BG,
    padding: 16,
    // top: -Constants.statusBarHeight,
    paddingTop: 16 + Constants.statusBarHeight,
  },
  bannerLeftContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  bannerStatusIcon: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: GLOBALS.COLORS.STATUS_YELLOW,
    marginRight: 10,
    marginTop: 2,
  },
  bannerText: {
    fontSize: 12,
    fontWeight: '500',
    maxWidth: 213,
    lineHeight: 18,
  },
  headerTopMargin: {
    height: StatusBar.currentHeight,
    backgroundColor: 'transparent',
  },
});

const platfromSpecificStyle =
  Platform.OS === 'ios' ? styles.activeWalletIos : {};

const mapStateToProps = state => ({
  auth: state.auth,
});

export default connect(mapStateToProps, {
  switchUser,
  fetchFeedData,
  clearFeed,
})(Header);
