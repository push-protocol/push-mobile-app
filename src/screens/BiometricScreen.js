import React, { Component } from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
  InteractionManager,
  ActivityIndicator,
  Keyboard,
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

import CryptoHelper from 'src/helpers/CryptoHelper';
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

export default class BiometricScreen extends Component {
  // CONSTRUCTOR
  constructor(props) {
    super(props);

    this.state = {
      transitionFinished: false,
      detailedInfoPresetned: false,

      fader: new Animated.Value(0),
      passcodeFader: new Animated.Value(1),

      passcode: '',
      passcodeMirror: '',
      passcodeMismatched: false,
      passcodeVerifyStep: false,
      passcodeConfirmedStep: false,

      pKeyEncrypted: false,
    }
  }

  // FUNCTIONS
  // Validate Pass Code
  validatePassCode = async (value) => {
    if (value.length != 6) {
      // if the value isn't equal to 6, it's not complete yet
      return;
    }

    if (this.state.passcodeVerifyStep == false) {
      const callback = () => {
        this.setState({
          passcodeMirror: '',
          passcodeVerifyStep: true
        });
      }

      this.fadeInPasscode(callback);
    }
    else {
      if (this.state.passcode !== this.state.passcodeMirror) {
        // Password mismatch, re-enter
        this.fadeInPasscode(this.resetPassCode());
      }
      else {
        Keyboard.dismiss();

        // Encrypt Private Key and Do Hashing
        const { privateKey } = this.props.route.params;
        const encryptedPkey = CryptoHelper.encrypWithAES(privateKey, this.state.passcode);
        const hashedCode = await CryptoHelper.hashWithSha256(this.state.passcode);
        const decrypt = CryptoHelper.decryptWithAES(
          'U2FsdGVkX1/MvNJhcMVylTvwAgjZDfk0i+t+nNopteCJKxZSGfNBG2fsmKfY2M8k9iGt0HwEldWCBbVaaAd5M6g9FqR0AQkfnVBdVtAOe9/YQAbsnzFadnDClB52D9zf',
          '131185'
        );
        console.log(decrypt);
        
        // Store private key and hashed code and continue
        await MetaStorage.instance.setEncryptedPKeyAndHashedPasscode(
          encryptedPkey,
          hashedCode,
        );

        this.setState({
          passcodeConfirmedStep: true,
          pKeyEncrypted: true,
        });
      }
    }
  }

  resetPassCode = (value) => {
    this.setState({
      passcode: '',
      passcodeMirror: '',
      passcodeMismatched: true,
      passcodeVerifyStep: false,
      passcodeConfirmedStep: false,
    });
  }

  // Set Pass Code
  changePassCode = (value) => {
    // accept only digits
    if (/^\d+$/.test(value) || value === '') {
      if (this.state.passcodeVerifyStep == false) {
        this.setState({
          passcode: value
        }, () => {
          this.validatePassCode(value);
        });
      }
      else {
        this.setState({
          passcodeMirror: value
        }, () => {
          this.validatePassCode(value);
        });
      }
    }

  }

  fadeInPasscode = (callback) => {
    this.setState({
      passcodeFader: new Animated.Value(0),
    }, () => {
      if (callback) {
        callback();
      }

      Animated.timing(this.state.passcodeFader, {
        toValue: 1,
      	duration: 250
      }).start();
    })
  }

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
      // All Clear, Proceed with storing Creds

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
        }
      ).start();
    })
  }

  // Load the Next Screen
  loadNextScreen = () => {
    const pkey = this.state.pk;

    // Goto Next Screen
    this.props.navigation.navigate('Biometric', {
      privateKey: this.state.pkey,
      wallet: this.state.wallet,
      ens: this.state.ens,
    });
  }

  // RETURN
  render() {
    const { navigation } = this.props;

    // Pick Passcode
    let passcodeSegment;

    if (this.state.passcodeVerifyStep == false) {
      passcodeSegment = this.state.passcode.split("");
    }
    else if (!this.state.passcodeConfirmedStep) {
      passcodeSegment = this.state.passcodeMirror.split("");
    }

    // For Changing Text Prompt
    let prompt = "[default:Pick a Passcode for your Vault]";
    if (this.state.passcodeMismatched && !this.state.passcodeVerifyStep) {
      prompt = "[error:Passcode Mismatch, Please Try Again]";
    }
    if (this.state.passcodeVerifyStep == true) {
      prompt = "[third:Re-enter your Passcode to verify]";
    }

    // For Keyboard Behavior
    let keyboardAvoidBehavior = "padding";
    if (Platform.OS === 'android') {
      keyboardAvoidBehavior = "height";
    }

    return (
      <React.Fragment>

        <SafeAreaView style={styles.container}>
          <ScreenFinishedTransition
            setScreenTransitionAsDone={
              () => {
                this.setState({
                  transitionFinished: true
                });
                this.refs.PasscodeInput.focus();
              }
            }
          />

        <Text style={styles.header}>Security</Text>
          <View style={styles.inner}>
            <DetailedInfoPresenter
              style={styles.intro}
              icon={require('assets/ui/biometric.png')}
              contentView={
                <View style={styles.introContent}>
                  {
                    this.state.passcodeConfirmedStep == false
                      ? <React.Fragment>
                          <StylishLabel
                            style={styles.para}
                            fontSize={16}
                            title='We need to create a [bold:Secure Vault] to store your [bold:Credentials].'
                          />

                          <Animated.View style={[
                              styles.passcodeContainer,
                              {opacity: this.state.passcodeFader}
                            ]}
                          >

                            <StylishLabel
                              style={[ styles.paracenter, styles.paraExtraMargin ]}
                              fontSize={16}
                              title={prompt}
                            />

                            <TextInput
                              ref="PasscodeInput"
                              style={styles.input}
                              maxLength={6}
                              contextMenuHidden={true}
                              keyboardType={'numeric'}
                              autoCorrect={false}
                              onChangeText={(value) => (this.changePassCode(value))}
                              value={this.state.passcodeVerifyStep ? this.state.passcodeMirror : this.state.passcode}
                            />

                            <View
                              style={styles.fancyTextContainer}
                              pointerEvents="none"
                            >
                              <View style={[ styles.fancyTextView, styles.fancyTextViewPrimary ]}>
                                <Text style={[ styles.fancyText, styles.fancyTextPrimary ]}>{passcodeSegment[0]}</Text>
                              </View>
                              <View style={[ styles.fancyTextView, styles.fancyTextViewPrimary ]}>
                                <Text style={[ styles.fancyText, styles.fancyTextPrimary ]}>{passcodeSegment[1]}</Text>
                              </View>
                              <View style={[ styles.fancyTextView, styles.fancyTextViewThird ]}>
                                <Text style={[ styles.fancyText, styles.fancyTextThird ]}>{passcodeSegment[2]}</Text>
                              </View>
                              <View style={[ styles.fancyTextView, styles.fancyTextViewThird ]}>
                                <Text style={[ styles.fancyText, styles.fancyTextThird ]}>{passcodeSegment[3]}</Text>
                              </View>
                              <View style={[ styles.fancyTextView, styles.fancyTextViewSecondary ]}>
                                <Text style={[ styles.fancyText, styles.fancyTextSecondary ]}>{passcodeSegment[4]}</Text>
                              </View>
                              <View style={[ styles.fancyTextView, styles.fancyTextViewSecondary ]}>
                                <Text style={[ styles.fancyText, styles.fancyTextSecondary ]}>{passcodeSegment[5]}</Text>
                              </View>
                            </View>
                          </Animated.View>
                        </React.Fragment>
                      : this.state.pKeyEncrypted == false
                          ? <ActivityIndicator
                              style = {styles.activity}
                              size = "small"
                              color = {GLOBALS.COLORS.GRADIENT_THIRD}
                            />
                          : <React.Fragment>
                              <StylishLabel
                                style={styles.para}
                                fontSize={16}
                                title="[third:Your Secure Vault is now protected by your Passcode!]"
                              />

                              <StylishLabel
                                style={styles.para}
                                fontSize={16}
                                title="[default:Note:] This passcode is not the same as your device's. Losing this means re-importing your wallet to access EPNS."
                              />
                            </React.Fragment>
                  }
                </View>
              }
              animated={!this.state.detailedInfoPresetned}
              startAnimation={this.state.transitionFinished}
              animationCompleteCallback={() => {this.animationFinished()}}
            />
          </View>

          <Animated.View style={[ styles.footer, {opacity: this.state.fader} ]}>
            {
              this.state.pKeyEncrypted == false
                ? null
                : <View style={styles.verifyFooter}>
                    <React.Fragment>
                      <PrimaryButton
                        iconFactory='Ionicons'
                        icon='ios-refresh'
                        iconSize={24}
                        title='Continue without Biometrics'
                        fontSize={16}
                        fontColor={GLOBALS.COLORS.BLACK}
                        bgColor={GLOBALS.COLORS.LIGHT_GRAY}
                        disabled={false}
                        onPress={() => {this.resetPKey()}}
                      />
                      <View style={styles.divider}></View>

                      <PrimaryButton
                        iconFactory='Ionicons'
                        icon='ios-arrow-forward'
                        iconSize={24}
                        title="Enable Biometric and Continue"
                        fontSize={16}
                        fontColor={GLOBALS.COLORS.WHITE}
                        bgColor={GLOBALS.COLORS.GRADIENT_THIRD}
                        disabled={false}
                        onPress={() => {this.loadNextScreen()}}
                      />
                    </React.Fragment>
                  </View>
            }


            <GetScreenInsets />
          </Animated.View>
        </SafeAreaView>

        {/* Overlay Blur and Notice to show in case permissions for camera aren't given */}
        <OverlayBlur
          ref='OverlayBlur'
        />

        <NoticePrompt
          ref='NoticePrompt'
          closeTitle='OK'
          closeFunc={() => this.toggleNoticePrompt(false, true)}
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
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    maxWidth: 540
  },
  intro: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  introContent: {
    marginTop: 20,
  },
  paraExtraMargin: {
    marginTop: 20,
  },
  para: {
    marginBottom: 20,
  },
  paracenter: {
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  passcodeContainer: {

  },
  input: {
    paddingHorizontal: 15,
    paddingVertical: 40,
    borderBottomWidth: 2,
    borderColor: GLOBALS.COLORS.BLACK,
    opacity: 0,
  },
  fancyTextContainer: {
    ...StyleSheet.absoluteFill,
    position: 'absolute',
    padding: 10,
    alignItems: 'center',
    justifyContent: 'space-around',
    flexDirection: 'row'
  },
  fancyTextView: {
    borderBottomWidth: 1,
    borderColor: GLOBALS.COLORS.BLACK,
  },
  fancyTextViewPrimary: {
    borderColor: GLOBALS.COLORS.GRADIENT_PRIMARY,
  },
  fancyTextViewSecondary: {
    borderColor: GLOBALS.COLORS.GRADIENT_SECONDARY,
  },
  fancyTextViewThird: {
    borderColor: GLOBALS.COLORS.GRADIENT_THIRD,
  },
  fancyText: {
    fontSize: 28,
    minWidth: 24,
    minHeight: 36,
    textAlign: 'center',
    color: GLOBALS.COLORS.BLACK
  },
  fancyTextPrimary: {
    color: GLOBALS.COLORS.GRADIENT_PRIMARY,
  },
  fancyTextSecondary: {
    color: GLOBALS.COLORS.GRADIENT_SECONDARY,
  },
  fancyTextThird: {
    color: GLOBALS.COLORS.GRADIENT_THIRD,
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
