import React, { Component } from 'react';
import {
  View,
  Text,
  InteractionManager,
  StyleSheet,
} from 'react-native';
import SafeAreaView from 'react-native-safe-area-view';
import { useFocusEffect } from '@react-navigation/native';

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

    // Testing Feed DB
    FeedDBHelper.getFeeds(0, 10);
  }

  // COMPONENT LOADED
  // Run as soon as loaded
  maintainer = async () => {
    // Since User is logged in, reset passcode attempts
    await MetaStorage.instance.setRemainingPasscodeAttempts(
      GLOBALS.CONSTANTS.MAX_PASSCODE_ATTEMPTS
    );

    // Get Wallet
    const wallet = this.props.route.params.wallet;
    Notifications.instance.associateToken(wallet); // While an async function, there is no need to wait
  }

  // Run After Transition is finished
  afterTransitionMaintainer = async () => {
    // Check Notifier
    await this.refs.EPNSNotifier.getBadgeCountAndRefresh();
  }

  // FUNCTIONS

  // Overlay Blur exit intent
  exitIntentOnOverleyBlur = () => {
    this.refs.ProfileDisplayer.toggleActive(false);
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

        <SafeAreaView style={styles.headerContainer}>
          <View style={styles.header}>
            {/* Header Comes Here */}
            <ProfileDisplayer
              ref="ProfileDisplayer"
              style={styles.profile}
              wallet={wallet}
              lockApp={() => {
                const { handleAppAuthState } = this.context;
                handleAppAuthState(APP_AUTH_STATES.ONBOARDED);
              }}
              toggleBlur={(toggle, animate) => {
                this.refs.OverlayBlur.changeRenderState(toggle, animate);
              }}
            />

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
              onPress={() => {
                navigation.navigate('Settings', {

                });
              }}
            />
          </View>
        </SafeAreaView>

        <SafeAreaView style={styles.container}>
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContainer: {
    flex: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  header: {
    flexDirection: 'row',
    marginLeft: GLOBALS.ADJUSTMENTS.SCREEN_GAP_HORIZONTAL/2, // For Profile Adjustment
    marginRight: GLOBALS.ADJUSTMENTS.SCREEN_GAP_HORIZONTAL,
    marginBottom: GLOBALS.ADJUSTMENTS.SCREEN_GAP_VERTICAL,
    marginHorizontal: GLOBALS.ADJUSTMENTS.SCREEN_GAP_HORIZONTAL,

    zIndex: 999,
  },
  profile: {

  },
  notifier: {
    marginTop: GLOBALS.ADJUSTMENTS.SCREEN_GAP_HORIZONTAL,
    marginRight: 10,
  },
  settings: {
    marginTop: GLOBALS.ADJUSTMENTS.SCREEN_GAP_HORIZONTAL,
    width: 24,
    height: 24,
  },
  content: {
    flex: 1,
    alignContent: 'center',
    justifyContent: 'center',
  }
});
