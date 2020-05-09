import React, { Component } from 'react';
import {
  View,
  Text,
  InteractionManager,
  StyleSheet,
} from 'react-native';
import SafeAreaView from 'react-native-safe-area-view';
import { useFocusEffect } from '@react-navigation/native';

import messaging from '@react-native-firebase/messaging';

import ProfileDisplayer from 'src/components/ui/ProfileDisplayer';
import EPNSNotifierIcon from 'src/components/custom/EPNSNotifierIcon';
import ImageButton from 'src/components/buttons/ImageButton';
import PrimaryButton from 'src/components/buttons/PrimaryButton';

import OverlayBlur from 'src/components/modals/OverlayBlur';

import FeedDBHelper from "src/helpers/FeedDBHelper";
import Notifications from "src/singletons/Notifications";
import MetaStorage from 'src/singletons/MetaStorage';

import AuthContext, {APP_AUTH_STATES} from 'src/components/auth/AuthContext';
import GLOBALS from 'src/Globals';

import CryptoHelper from 'src/helpers/CryptoHelper';

function ScreenFinishedTransition({ runAfterScreenTransition }) {
  useFocusEffect(
    React.useCallback(() => {
      const task = InteractionManager.runAfterInteractions(() => {
        // After screen is loaded
        runAfterScreenTransition();
      });

      return () => task.cancel();
    }, [])
  );

  return null;
}

export default class HomeScreen extends Component {
  // CONSTRUCTOR
  constructor(props) {
    super(props);

    this.state = {
      transitionFinished: false,
    }
  }

  // COMPONENT MOUNTED
  async componentDidMount() {
    await this.maintainer();

    // To Output msg payload for testing
    // this.outputSecretMsgPayload();

    // Testing Feed DB
    const db = FeedDBHelper.getDB();
    const feeds = await FeedDBHelper.getFeeds(db, 0, 10);
    console.log(feeds);

  }

  // COMPONENT LOADED
  // Run as soon as loaded
  maintainer = async () => {
    // Set Notification Listener
    Notifications.instance.setNotificationListenerCallback(() => {
      console.log("update ringer");
      this.onNotificationListenerUpdate()
    });

    // Since User is logged in, reset passcode attempts
    await MetaStorage.instance.setRemainingPasscodeAttempts(
      GLOBALS.CONSTANTS.MAX_PASSCODE_ATTEMPTS
    );
  }

  // Run After Transition is finished
  afterTransitionMaintainer = async () => {
    // Get Wallet
    const wallet = this.props.route.params.wallet;
    Notifications.instance.associateToken(wallet); // While an async function, there is no need to wait

    // Trigger Notification Update
    await this.onNotificationListenerUpdate();

    // First sign in by user
    const firstSignIn = await MetaStorage.instance.getFirstSignInByUser();
    if (firstSignIn) {
      // Set it to false for future
      await MetaStorage.instance.setFirstSignInByUser(false);
    }
    else {
      // Refresh feed automatically
      this.refreshFeeds();
    }
  }

  // Component Unmounted
  componentWillUnmount() {
    // Reset Callback of notification
    Notifications.instance.setNotificationListenerCallback(null);
  }

  // FUNCTIONS

  // To refresh the bell badge
  onNotificationListenerUpdate = async () => {
    // Check Notifier
    await this.refs.EPNSNotifier.getBadgeCountAndRefresh();
  }

  // To refresh the Feeds
  refreshFeeds = async () => {

  }

  // Overlay Blur exit intent
  exitIntentOnOverleyBlur = () => {
    this.refs.ProfileDisplayer.toggleActive(false);
  }

  // To output secret msg payload, only used in testing
  outputSecretMsgPayload = async () => {
    const pkey = this.props.route.params.pkey; // The private key used

    const secret = "Random15Pass"; // 15 or less characters
    const sub = "Hey this is subject"; // This is subject
    const msg = "This message can go up to 200 letters I think, This message can go up to 200 letters I think"; // The intended msg
    const cta = "https://someurl.com/"; // the call to action
    const imgurl = "https://someimageurl.com/image.jpeg" // the url of image

    CryptoHelper.outputMsgPayload(secret, sub, msg, cta, imgurl, pkey);
  }

  // RENDER
  render() {
    const {
      navigation,
    } = this.props;

    const {
      wallet,
      pkey
    } = this.props.route.params;

    return (
      <View style={styles.container}>

        <ScreenFinishedTransition
          runAfterScreenTransition={
            () => {
              this.setState({
                transitionFinished: true
              });

              this.afterTransitionMaintainer();
            }
          }
        />

        {/* Has absolute Header so goes on top */}
        <ProfileDisplayer
          ref="ProfileDisplayer"
          style={styles.profile}
          wallet={wallet}
          lockApp={() => {
            const { handleAppAuthState } = this.context;
            handleAppAuthState(APP_AUTH_STATES.ONBOARDED);
          }}
        />

        <SafeAreaView style={styles.container}>
          <View style={styles.header}>
            {/* Header Comes Here */}
            <EPNSNotifierIcon
              ref='EPNSNotifier'
              style={styles.notifier}
              iconSize={32}
              onPress={() => {

              }}
              onNewNotifications={() => {

              }}
            />

            <ImageButton
              style={styles.settings}
              src={require('assets/ui/settings.png')}
              iconSize={24}
              onPress={() => {
                navigation.navigate('Settings', {

                });
              }}
            />
          </View>
          <View style={styles.content}>
            <Text>Hello World!</Text>
          </View>
        </SafeAreaView>

        {/* Overlay Blur to show incase need to emphasize on something */}
        <OverlayBlur
          ref='OverlayBlur'
          onPress={
            ()=>{
              this.exitIntentOnOverleyBlur()
            }
          }
        />
      </View>
    );
  }
}

// Connect to Auth Context
HomeScreen.contextType = AuthContext;

// Styling
const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profile: {
    position: 'absolute',
    top: 0,
    right: 0,
    left: 0,
    bottom: 0,
    zIndex: 99
  },
  header: {
    flexDirection: 'row',
    alignSelf: 'stretch',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginHorizontal: GLOBALS.ADJUSTMENTS.SCREEN_GAP_HORIZONTAL,
    zIndex: 99,
    height: 55,
  },
  notifier: {
    marginTop: GLOBALS.ADJUSTMENTS.SCREEN_GAP_HORIZONTAL,
    marginRight: 10,
  },
  settings: {
    marginTop: GLOBALS.ADJUSTMENTS.SCREEN_GAP_HORIZONTAL,
    width: 24,
  },
  content: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  }
});
