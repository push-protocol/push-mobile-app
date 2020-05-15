import React, { Component } from 'react';
import {
  View,
  Text,
  Image,
  InteractionManager,
  Animated,
  AsyncStorage,
  StyleSheet,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView, useSafeArea } from 'react-native-safe-area-context';

import StylishLabel from 'src/components/labels/StylishLabel';
import DetailedInfoPresenter from 'src/components/misc/DetailedInfoPresenter';
import PrimaryButton from 'src/components/buttons/PrimaryButton';

import CryptoHelper from 'src/helpers/CryptoHelper';
import FeedDBHelper from 'src/helpers/FeedDBHelper';
import MetaStorage from 'src/singletons/MetaStorage';

import AuthContext, {APP_AUTH_STATES} from 'src/components/auth/AuthContext';
import GLOBALS from 'src/Globals';

function ScreenFinishedTransition({ setScreenTransitionAsDone }) {
  useFocusEffect(
    React.useCallback(() => {
      const task = InteractionManager.runAfterInteractions(() => {
        // After screen is loaded
        setScreenTransitionAsDone();
      });

      return () => task.cancel();
    }, [])
  );

  return null;
}

function GetScreenInsets() {
  const insets = useSafeArea();
  if (insets.bottom > 0) {
    // Adjust inset by
    return <View style={styles.insetAdjustment}></View>;
  }
  else {
    return <View style={styles.noInsetAdjustment}></View>;
  }
}

export default class SetupCompleteScreen extends Component {
  // CONSTRUCTOR
  constructor(props) {
    super(props);

    this.state = {
      transitionFinished: false,
      detailedInfoPresetned: false,

      singingUserIn: false,
      fader: new Animated.Value(0)
    }
  }

  // FUNCTIONS
  // When Animation is Finished
  animationFinished = () => {
    this.setState({
      detailedInfoPresetned: true,
    }, ()=> {
      Animated.timing(
        this.state.fader, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }
      ).start();
    })
  }

  // Load the Next Screen
  loadNextScreen = async () => {
    // Nothing to load, Basically Signing is completed
    // All done, set to true
    this.setState({
      singingUserIn: true
    });

    // Set SignedIn to true
    await MetaStorage.instance.setIsSignedIn(true);

    // Set First Sign in to true
    await MetaStorage.instance.setFirstSignInByUser(true);

    // Reset number of passcode attempts since it's a valid login
    await MetaStorage.instance.setRemainingPasscodeAttempts(GLOBALS.CONSTANTS.MAX_PASSCODE_ATTEMPTS);

    // Set Push Notification Badge
    await MetaStorage.instance.setCurrentAndPreviousBadgeCount(0, 0);

    // Create DB connection
    const db = await FeedDBHelper.getDB();

    // Create / Recreate Feed
    await FeedDBHelper.createTable(db);

    // Form payload template
    const appName = GLOBALS.LINKS.APPBOT_NAME;
    const appURL = GLOBALS.LINKS.APP_WEBSITE;

    let payload = {
      sid: -1, // Always -1 for Internal Payload
      type: 1, // Unencrypted Message (1) or Encrypted Message (2)
      app: appName,
      icon: 'na',
      url: appURL,
      appbot: "1",
      secret: '',
      sub: '',
      msg: '',
      cta: '',
      img: '',
      hidden: "0",
      epoch: new Date().getTime(),
    };

    // Set last message first
    // 5. Secrets... shhh!!!
    const { privateKey } = this.props.route.params;
    const plainSecret = "EPNSRocks!";
    const encryptedSecret = await CryptoHelper.encryptWithECIES(plainSecret, privateKey);

    // console.log(encryptedSecret);
    // const dec = await CryptoHelper.decryptWithECIES(encryptedSecret, privateKey);
    // console.log(dec);

    let sub = "Secrets... shhh!!!";
    let msg = "The [default:coolest type] of messages are [third:secrets]. They are indicated by the [bolditalics:shush gradient] on the top left of the message box.\n\nThey are always [default:encrypted] and [bold:only you] can see them.";
    let cta = '';
    let img = '';
    let epoch = new Date().getTime();

    secret = encryptedSecret;
    sub = CryptoHelper.encryptWithAES(sub, plainSecret);
    msg = CryptoHelper.encryptWithAES(msg, plainSecret);
    cta = cta === '' ? cta : CryptoHelper.encryptWithAES(cta, plainSecret);
    img = img === '' ? img : CryptoHelper.encryptWithAES(img, plainSecret);

    payload.secret = secret;
    payload.type = 2;
    payload.sub = sub;
    payload.msg = msg;
    payload.cta = cta;
    payload.img = img;
    payload.epoch = epoch;

    // Add to Feed DB
    await FeedDBHelper.addFeedFromPayloadObject(db, payload);
    payload.secret = ''; // don't need to use secret anymore
    payload.type = 1; // reset payload type as well

    // 4. Notification Types
    payload.sub = "Nofications Types";
    payload.msg = "Notifications are [bold:never boring] in EPNS.\n\nThe messages with [bold:blueish outlines] are links that the [bold:dApp] has provided you. \n\n[default:Tapping the message opens it.]";
    payload.cta = 'https://epns.io';
    payload.img = '';
    payload.epoch = new Date().getTime();

    // Add to Feed DB
    await FeedDBHelper.addFeedFromPayloadObject(db, payload);

    // 3. Ring the Bell
    payload.sub = "Ring the Bell";
    payload.msg = "The [default:Bell] on the [bold:top right] keeps track of any incoming messages and will inform you about it.\n\nClicking on the [bold:bell] will update your feed [italics:(Alternatively, pull feed down to refresh)]";
    payload.cta = '';
    payload.img = 'https://i.ibb.co/SvYGCY9/epnsappbellturorial.jpg';
    payload.epoch = new Date().getTime();

    // Add to Feed DB
    await FeedDBHelper.addFeedFromPayloadObject(db, payload);

    // 2. About dApps
    payload.sub = "About Channels";
    payload.msg = "[default:Channels] represent your favorite [bold:dApps] or [bold:Smart Contracts]. You will often get notifications from different channels.\n\nThe [bold:top section] of the message contains information about these channels.\n\n[bold:Clicking on it] takes you to their [bold:website].";
    payload.cta = '';
    payload.img = '';
    payload.epoch = new Date().getTime();

    // Add to Feed DB
    await FeedDBHelper.addFeedFromPayloadObject(db, payload);

    // 1. Welcome to EPNS
    payload.sub = "Welcome to EPNS";
    payload.msg = "[bold:Greetings] fellow users! Welcome aboard!\n\nI am your personalized [default:App Bot] whose sole purpose is to guide you about the app.\n\nTo get started! [bold:Swipe Right to Archive this.]";
    payload.cta = '';
    payload.img = '';
    payload.epoch = new Date().getTime();

    // Add to Feed DB
    await FeedDBHelper.addFeedFromPayloadObject(db, payload);

    // Handle App Auth Flow
    const { handleAppAuthState } = this.context;
    handleAppAuthState(APP_AUTH_STATES.ONBOARDED);
  }

  // RETURN
  render() {
    const { navigation } = this.props;

    return (
      <SafeAreaView style={styles.container}>
        <ScreenFinishedTransition
          setScreenTransitionAsDone={
            () => {
              this.setState({
                transitionFinished: true
              });
            }
          }
        />
      <Text style={styles.header}>All Done!</Text>
        <View style={styles.inner}>
          <DetailedInfoPresenter
            style={styles.intro}
            icon={require('assets/ui/check.png')}
            contentView={
              <View style={styles.introContent}>
                <StylishLabel
                  style={styles.para}
                  fontSize={24}
                  title='[third:Congrats!]'
                />

                <StylishLabel
                  style={styles.para}
                  fontSize={16}
                  title='[bold:EPNS] is all setup and ready to rock!'
                />

                <StylishLabel
                  style={styles.para}
                  fontSize={16}
                  title='Visit [url:app.epns.io||https://aap.epns.io] from a [bold:Web3 Enabled Browser] to subscribe to your favorite [default:dApp channels] and start recieving [bold:messages!]'
                />
              </View>
            }
            animated={!this.state.detailedInfoPresetned}
            startAnimation={this.state.transitionFinished}
            animationCompleteCallback={() => {this.animationFinished()}}
          />
        </View>
        <Animated.View style={[ styles.footer, {opacity: this.state.fader} ]}>
          <PrimaryButton
            iconFactory='Ionicons'
            icon='ios-arrow-forward'
            iconSize={24}
            title='Complete Setup'
            fontSize={16}
            fontColor={GLOBALS.COLORS.WHITE}
            bgColor={GLOBALS.COLORS.GRADIENT_THIRD}
            disabled={false}
            loading={this.state.singingUserIn}
            onPress={() => {this.loadNextScreen()}}
          />
          <GetScreenInsets />
        </Animated.View>
      </SafeAreaView>
    );
  }
}

// Connect to Auth Context
SetupCompleteScreen.contextType = AuthContext;

// Styling
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: GLOBALS.COLORS.WHITE,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  header: {
    fontSize: 32,
    fontWeight: 'bold',
    paddingTop: 40,
    paddingHorizontal: 20,
  },
  inner: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  intro: {
    padding: 20,
    maxWidth: 540,
  },
  introContent: {
    marginTop: 20,
  },
  para: {
    marginBottom: 20,
  },
  paraend: {
    marginBottom: 0,
  },
  footer: {
    width: '100%',
    paddingHorizontal: 20,
  },
  insetAdjustment: {
    paddingBottom: 5,
  },
  noInsetAdjustment: {
    paddingBottom: 20,
  }
});
