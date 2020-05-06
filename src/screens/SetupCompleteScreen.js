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
    // Set SignedIn to true
    await MetaStorage.instance.setIsSignedIn(true);

    // Reset number of passcode attempts since it's a valid login
    await MetaStorage.instance.setRemainingPasscodeAttempts(GLOBALS.CONSTANTS.MAX_PASSCODE_ATTEMPTS);

    // Set Push Notification Badge
    await MetaStorage.instance.setCurrentAndPreviousBadgeCount(1, 0);

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
                  style={styles.paraend}
                  fontSize={16}
                  title='Visit [url:app.epns.io||https://aap.epns.io] from a [bold:Web3 Enabled Browser] to subscribe to your favorite [bold:dApps] or [bold:Smart Contract].'
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
