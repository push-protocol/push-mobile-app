import React, { Component } from 'react';
import {
  View,
  Text,
  Image,
  InteractionManager,
  Animated,
  StyleSheet,
} from 'react-native';
import { SafeAreaView, useSafeArea } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import * as Permissions from 'expo-permissions';

import { useFocusEffect } from '@react-navigation/native';
import { useHeaderHeight } from '@react-navigation/stack';

import StylishLabel from 'src/components/labels/StylishLabel';
import DetailedInfoPresenter from 'src/components/misc/DetailedInfoPresenter';
import PrimaryButton from 'src/components/buttons/PrimaryButton';

import OverlayBlur from 'src/components/modals/OverlayBlur';
import NoticePrompt from 'src/components/modals/NoticePrompt';
import TextEntryPrompt from 'src/components/modals/TextEntryPrompt';
import QRScanner from 'src/components/modals/QRScanner';

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

export default class SignInScreen extends Component {
  // CONSTRUCTOR
  constructor(props) {
    super(props);

    this.state = {
      transitionFinished: false,
      fader: new Animated.Value(0),
      pkey: null,
      pkeyAcquired: false,
    }
  }

  // FUNCTIONS
  // Open Notice Prompt With Overlay Blur
  toggleNoticePrompt = (toggle, animate, title, subtitle, notice, showIndicator) => {
    // Set Notice First
    this.refs.NoticePrompt.changeTitle(title);
    this.refs.NoticePrompt.changeSubtitle(subtitle);
    this.refs.NoticePrompt.changeNotice(notice);
    this.refs.NoticePrompt.changeIndicator(showIndicator);

    // Set render state of this and the animate the blur modal in
    this.refs.OverlayBlur.changeRenderState(toggle, animate);
    this.refs.NoticePrompt.changeRenderState(toggle, animate);
  }

  // Open Text Prompt With Overlay Blur
  toggleTextEntryPrompt = (toggle, animate) => {
    // Clear Text Prompt


    // Set render state of this and the animate the blur modal in
    this.refs.OverlayBlur.changeRenderState(toggle, animate);
    this.refs.TextEntryPrompt.changeRenderState(toggle, animate);
  }

  // Open QR Scanner
  toggleQRScanner = (toggle, navigation) => {
    this.refs.QRScanner.changeRenderState(toggle, navigation);
  }

  // Users Permissions
  getCameraPermissionAsync = async (navigation) => {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    if (status !== 'granted') {
      this.toggleNoticePrompt(
        true,
        true,
        'Camera Access',
        'Need Camera Permissions for scanning QR Code',
        'Please enable Camera Permissions from [appsettings:App Settings] to continue',
        false
      );
    }
    else {
      // All Clear, open QR Scanner
      this.toggleQRScanner(true, navigation);
    }
  }

  // Detect QR Code
  onQRDetect = (code) => {

  }

  // When Animation is Finished
  animationFinished = () => {
    Animated.timing(
      this.state.fader, {
        toValue: 1,
        duration: 250,
      }
    ).start();
  }

  // Load the Next Screen
  loadNextScreen = () => {
    const pkey = this.state.pk;

    this.setState({
      pkey: null,
      pkeyAcquired: true,
    }, () => {
      // Goto Next Screen
      this.props.navigation.navigate('Biometric', {
        privateKey: this.state.pk
      });
    });
  }

  // RETURN
  render() {
    const { navigation } = this.props;

    return (
      <React.Fragment>

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

          <Text style={styles.header}>Sign In!</Text>
          <View style={styles.inner}>
            <DetailedInfoPresenter
              style={styles.intro}
              icon={require('assets/ui/wallet.png')}
              contentView={
                <View>
                  <StylishLabel
                    style={styles.para}
                    fontSize={16}
                    title='[bold:EPNS] requires your wallet credentials [italics:(Private Key)] to [bold:Verify You & Decrypt] your messages.'
                  />

                  <StylishLabel
                    style={styles.para}
                    fontSize={16}
                    title='[default:Note:] At no time does your credentials goes out of the device for any purpose whatsoever.'
                  />
                </View>
              }
              animated={true}
              startAnimation={this.state.transitionFinished}
              animationCompleteCallback={() => {this.animationFinished()}}
            />
          </View>
          <Animated.View style={[ styles.footer, {opacity: this.state.fader} ]}>
            <PrimaryButton
              iconFactory='Ionicons'
              icon='ios-qr-scanner'
              iconSize={24}
              title='Scan via QR Code'
              fontSize={16}
              fontColor={GLOBALS.COLORS.WHITE}
              bgColor={GLOBALS.COLORS.GRADIENT_SECONDARY}
              disabled={false}
              onPress={() => {this.getCameraPermissionAsync(navigation)}}
            />

            <View style={styles.divider}></View>

            <PrimaryButton
              iconFactory='Ionicons'
              icon='ios-code-working'
              iconSize={24}
              title='Enter Manually'
              fontSize={16}
              fontColor={GLOBALS.COLORS.WHITE}
              bgColor={GLOBALS.COLORS.GRADIENT_THIRD}
              disabled={false}
              onPress={() => {this.toggleTextEntryPrompt(true, true)}}
            />
            <GetScreenInsets />
          </Animated.View>
        </SafeAreaView>

        <QRScanner
          ref='QRScanner'
          navigation={navigation}
          doneFunc={(code) => {
            this.onQRDetect(code)
          }}
          closeFunc={() => this.toggleQRScanner(false, navigation)}
        />

        {/* Overlay Blur and Notice to show in case permissions for camera aren't given */}
        <OverlayBlur
          ref='OverlayBlur'
        />

        <NoticePrompt
          ref='NoticePrompt'
          closeTitle='OK'
          closeFunc={() => this.toggleNoticePrompt(false, true)}
        />

        <TextEntryPrompt
          ref='TextEntryPrompt'
          title='Enter Private Key'
          subtitle='Please enter the Private Key of your Wallet.'
          doneTitle='Verify!'
          doneFunc={(code) => {
            this.onQRDetect(code)
          }}
          closeTitle='Cancel'
          closeFunc={() => this.toggleTextEntryPrompt(false, true)}
        />

      </React.Fragment>
    );
  }
}

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
    maxWidth: 500,
  },
  para: {
    paddingTop: 20,
  },
  footer: {
    width: '100%',
    paddingHorizontal: 20,
  },
  divider: {
    marginVertical: 10,
    width: '100%',
  },
  insetAdjustment: {
    paddingBottom: 5,
  },
  noInsetAdjustment: {
    paddingBottom: 20,
  }
});
