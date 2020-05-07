import React, { Component } from 'react';
import {
  View,
  Text,
  Image,
  InteractionManager,
  Animated,
  StyleSheet,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView, useSafeArea } from 'react-native-safe-area-context';

import * as Permissions from 'expo-permissions';

import StylishLabel from 'src/components/labels/StylishLabel';
import DetailedInfoPresenter from 'src/components/misc/DetailedInfoPresenter';
import PrimaryButton from 'src/components/buttons/PrimaryButton';

import OverlayBlur from 'src/components/modals/OverlayBlur';
import NoticePrompt from 'src/components/modals/NoticePrompt';
import PKEntryPrompt from 'src/components/modals/PKEntryPrompt';
import QRScanner from 'src/components/modals/QRScanner';

import PKProfileBuilder from 'src/components/web3/PKProfileBuilder';

import MetaStorage from 'src/singletons/MetaStorage';

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
      detailedInfoPresetned: false,

      fader: new Animated.Value(0),
      pkey: '',
      wallet: '',
      ens: '',
      pkeyVerified: false,
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
    // Temp Remove Later
    const code = "0x789af986260800ff255a4e84311ec44de6efd7c595115e9176c77814652e668c";
    this.onPKDetect(code);
    return;

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

  // Detect PK Code
  onPKDetect = (code) => {
    this.setState({
      pkey: code,
    })
  }

  // Reset PK Code
  resetPKey = () => {
    this.setState({
      pkey: '',
      pkeyVerified: false,

      fader: new Animated.Value(0),
    }, () => {
      Animated.timing(
        this.state.fader, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }
      ).start();
    });
  }

  // Handle Profile Info
  profileInfoFetched = (wallet, ens) => {
    this.setState({
      wallet: wallet,
      ens: ens,
      pkeyVerified: true,

      fader: new Animated.Value(0),
    }, () => {
      Animated.timing(
        this.state.fader, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }
      ).start();
    });
  }

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
    // Store ENS and Wallet in Storage and then move ahead
    const walletObj = {
      ensRefreshTime: new Date().getTime() / 1000, // Time in epoch
      ens: this.state.ens,
      wallet: this.state.wallet,
    }
    // console.log(walletObj);

    await MetaStorage.instance.setStoredWallet(walletObj);

    // Goto Next Screen
    this.props.navigation.navigate('Biometric', {
      privateKey: this.state.pkey,
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
            {
              this.state.pkey === ''
                ? <DetailedInfoPresenter
                    style={styles.intro}
                    icon={require('assets/ui/wallet.png')}
                    contentView={
                      <View style={styles.introContent}>
                        <StylishLabel
                          style={styles.para}
                          fontSize={16}
                          title='[bold:EPNS] requires your wallet credentials [italics:(Private Key)] to [bold:Verify You & Decrypt] your messages.'
                        />

                        <StylishLabel
                          style={styles.paraend}
                          fontSize={16}
                          title='[default:Note:] At no time does your credentials goes out of the device for any purpose whatsoever.'
                        />
                      </View>
                    }
                    animated={!this.state.detailedInfoPresetned}
                    startAnimation={this.state.transitionFinished}
                    animationCompleteCallback={() => {this.animationFinished()}}
                  />
                : <PKProfileBuilder
                    style={styles.profile}
                    forPKey={this.state.pkey}
                    resetFunc={() => {this.resetPKey()}}
                    profileInfoFetchedFunc={(wallet, ens) => {this.profileInfoFetched(wallet, ens)}}
                  />
            }
          </View>
          <Animated.View style={[ styles.footer, {opacity: this.state.fader} ]}>
            {
              this.state.pkey === ''
                ? <View style={styles.entryFooter}>
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
                  </View>
                : <View style={styles.verifyFooter}>
                    {
                      this.state.pkeyVerified == false
                        ? null
                        : <React.Fragment>
                            <PrimaryButton
                              iconFactory='Ionicons'
                              icon='ios-refresh'
                              iconSize={24}
                              title='Reset / Use Different Wallet'
                              fontSize={16}
                              fontColor={GLOBALS.COLORS.WHITE}
                              bgColor={GLOBALS.COLORS.GRADIENT_PRIMARY}
                              disabled={false}
                              onPress={() => {this.resetPKey()}}
                            />
                            <View style={styles.divider}></View>

                            <PrimaryButton
                              iconFactory='Ionicons'
                              icon='ios-arrow-forward'
                              iconSize={24}
                              title="Continue"
                              fontSize={16}
                              fontColor={GLOBALS.COLORS.WHITE}
                              bgColor={GLOBALS.COLORS.GRADIENT_THIRD}
                              disabled={false}
                              onPress={() => {this.loadNextScreen()}}
                            />
                          </React.Fragment>
                    }

                  </View>
            }


            <GetScreenInsets />
          </Animated.View>
        </SafeAreaView>

        <QRScanner
          ref='QRScanner'
          navigation={navigation}
          doneFunc={(code) => {
            this.onPKDetect(code)
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

        <PKEntryPrompt
          ref='TextEntryPrompt'
          title='Enter Private Key'
          subtitle='Please enter the Private Key of your Wallet.'
          doneTitle='Verify!'
          doneFunc={(code) => {
            this.onPKDetect(code)
          }}
          closeTitle='Cancel'
          closeFunc={() => this.toggleTextEntryPrompt(false, true)}
        />

      </React.Fragment>
    );
  }
}

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
    padding: 20,
    maxWidth: 540,
  },
  intro: {
    alignItems: 'center',
    justifyContent: 'center',
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
  profile: {
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