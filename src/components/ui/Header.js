import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import SafeAreaView from 'react-native-safe-area-view';
import Constants from "expo-constants";

import ProfileDisplayer from "src/components/ui/ProfileDisplayer";
import EPNSNotifierIcon from "src/components/custom/EPNSNotifierIcon";
import ImageButton from "src/components/buttons/ImageButton";

import Notify from "src/singletons/Notify";

import AuthContext, { useAuthContext, APP_AUTH_STATES } from "src/components/auth/AuthContext";
import GLOBALS from 'src/Globals';

const Header = ({ style, wallet }) => {
  const navigation = useNavigation();
  const route = useRoute();

  const authContext = useAuthContext();

  // Setup Refs
  const ProfileDisplayerRef = useRef(null);
  const EPNSNotifierIconRef = useRef(null);

  useEffect(() => {
    // Set Notification Listener
    Notify.instance.setNotificationListenerCallback(() => {
      onNotificationListenerUpdate();
    });
	}, []);

  // To refresh the bell badge
  const onNotificationListenerUpdate = async () => {
  	// Check Notifier
    await EPNSNotifierIconRef.current.getBadgeCountAndRefresh();
  };

  // Overlay Blur exit intent
  const exitIntentOnOverleyBlur = () => {
    ProfileDisplayerRef.current.toggleActive(false);
  };

  return (
    <SafeAreaView style={[ styles.container, style ]}>
      {/* Header Comes Here */}
      <View style={styles.header}>
        <ProfileDisplayer
          ref={ProfileDisplayerRef}
          style={styles.profile}
          wallet={wallet}
          lockApp={() => {
            authContext.handleAppAuthState(APP_AUTH_STATES.ONBOARDED);
          }}
        />
        <EPNSNotifierIcon
          ref={EPNSNotifierIconRef}
          style={styles.notifier}
          iconSize={32}
          onPress={() => {
            // Refresh the feeds
            navigation.navigate("Feed", {
              refreshNotifFeed: true
            });

            navigation.setParams({refreshNotifFeed: true})
          }}
          onNewNotifications={() => {
            // Do nothing for now, bell is ringing in the module anyway
          }}
        />
        <ImageButton
          style={styles.settings}
          src={require("assets/ui/settings.png")}
          iconSize={24}
          onPress={() => {
            // // Finally associate token to server if not done
            // const publicKey = CryptoHelper.getPublicKeyFromPrivateKey(this.props.route.params.pkey);
            // const privateKey = this.props.route.params.pkey;
            //
            // // While an async function, there is no need to wait
            // ServerHelper.associateTokenToServer(publicKey, privateKey);

            navigation.navigate("Settings", {});
          }}
        />
      </View>
    </SafeAreaView>
  );
};

// Styling
const styles = StyleSheet.create({
  container: {
    paddingTop: Constants.statusBarHeight,
    backgroundColor: GLOBALS.COLORS.WHITE
  },
  header: {
    flexDirection: "row",
    alignSelf: "stretch",
    // justifyContent: "flex-end",
    alignItems: "center",
    marginHorizontal: GLOBALS.ADJUSTMENTS.SCREEN_GAP_HORIZONTAL,
    zIndex: 99,
    height: GLOBALS.CONSTANTS.STATUS_BAR_HEIGHT,
  },
  profile: {
    // position: "absolute",
    // top: 0,
    // right: 0,
    // left: 0,
    // bottom: 0,
    // zIndex: 99,
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
});

export default Header;
