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

import CryptoHelper from 'src/helpers/CryptoHelper';
const SECRET = "Random15Pass";
const SUBJECT = "Hey this is subject";
const MESSAGE = "This message can go up to 200 letters I think, This message can go up to 200 letters I think";
const CALL_TO_ACTION = "https://someurl.com/";
const IMAGE_URL = "https://venturebeat.com/wp-content/uploads/2020/01/doom-eternal-4.jpg?w=1200&strip=all"



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
    //FeedDBHelper.getFeeds(0, 10);

    // Output AES
    console.log("[AES ENCRYTED FORMAT (" + new Date() + ")");
    console.log("---------------------");
    console.log("secret --> ");
    const secretEncrypted = await CryptoHelper.encryptWithECIES(SECRET, this.props.route.params.pkey);
    const asubE = CryptoHelper.encryptWithAES(SUBJECT, SECRET);
    const amsgE = CryptoHelper.encryptWithAES(MESSAGE, SECRET);
    const actaE = CryptoHelper.encryptWithAES(CALL_TO_ACTION, SECRET);
    const aimgE = CryptoHelper.encryptWithAES(IMAGE_URL, SECRET);

    console.log(secretEncrypted);
    console.log("asub --> ");
    console.log(asubE);
    console.log("amsg --> ");
    console.log(amsgE);
    console.log("acta --> ");
    console.log(actaE);
    console.log("aimg --> ");
    console.log(aimgE);
    console.log("decrypted secret --> ");
    console.log(await CryptoHelper.decryptWithECIES(secretEncrypted, this.props.route.params.pkey));
    console.log("decrypted asub --> ");
    console.log(CryptoHelper.decryptWithAES(asubE, SECRET));
    console.log("decrypted amsg --> ");
    console.log(CryptoHelper.decryptWithAES(amsgE, SECRET));
    console.log("decrypted acta --> ");
    console.log(CryptoHelper.decryptWithAES(actaE, SECRET));
    console.log("decrypted aimg --> ");
    console.log(CryptoHelper.decryptWithAES(aimgE, SECRET));
  }

  // COMPONENT LOADED
  // Run as soon as loaded
  maintainer = async () => {
    // Since User is logged in, reset passcode attempts
    await MetaStorage.instance.setRemainingPasscodeAttempts(
      GLOBALS.CONSTANTS.MAX_PASSCODE_ATTEMPTS
    );
  }

  // Run After Transition is finished
  afterTransitionMaintainer = async () => {
    // Check Notifier
    await this.refs.EPNSNotifier.getBadgeCountAndRefresh();

    // Get Wallet
    const wallet = this.props.route.params.wallet;
    Notifications.instance.associateToken(wallet); // While an async function, there is no need to wait
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
