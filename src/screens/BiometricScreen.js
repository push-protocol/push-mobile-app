import React, { Component } from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
  InteractionManager,
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Vibration,
  Animated,
  StyleSheet,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView, useSafeArea } from 'react-native-safe-area-context';

import messaging from '@react-native-firebase/messaging';

import { BlurView } from 'expo-blur';
import * as LocalAuthentication from 'expo-local-authentication';
import * as Permissions from 'expo-permissions';

import * as Keychain from 'react-native-keychain';

import StylishLabel from 'src/components/labels/StylishLabel';
import DetailedInfoPresenter from 'src/components/misc/DetailedInfoPresenter';
import PrimaryButton from 'src/components/buttons/PrimaryButton';

import OverlayBlur from 'src/components/modals/OverlayBlur';
import NoticePrompt from 'src/components/modals/NoticePrompt';

import CryptoHelper from 'src/helpers/CryptoHelper';
import BiometricHelper from 'src/helpers/BiometricHelper';
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

      pkeyEncrypted: false,
      encryptedPKey: '',

      biometricSupported: false, // false or as per LocalAuthentication
      biometricEnabled: false,
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
        }, () => {
          if (this.refs.PasscodeInput) {
            this.refs.PasscodeInput.focus();
          }
        });
      }

      this.fadeInPasscode(callback);
    }
    else {
      if (this.state.passcode !== this.state.passcodeMirror) {
        // Password mismatch, re-enter
        Vibration.vibrate();
        this.fadeInPasscode(this.resetPassCode());
      }
      else {
        Keyboard.dismiss();

        // Encrypt Private Key and Do Hashing
        const { privateKey } = this.props.route.params;
        const encryptedPkey = CryptoHelper.encryptWithAES(privateKey, this.state.passcode);
        const hashedCode = await CryptoHelper.hashWithSha256(this.state.passcode);

        // Store private key and hashed code and continue
        await MetaStorage.instance.setEncryptedPKeyAndHashedPasscode(
          encryptedPkey,
          hashedCode,
        );

        // Check if biometric is available
        const biometricSupported = await BiometricHelper.getSupportedBiometric();

        this.setState({
          passcodeConfirmedStep: true,
          pkeyEncrypted: true,
          encryptedPKey: encryptedPkey,

          biometricSupported: biometricSupported,
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
      	duration: 250,
        useNativeDriver: true,
      }).start();
    })
  }

  // Open Notice Prompt With Overlay Blur
  toggleNoticePrompt = (toggle, animate, title, subtitle, notice, showIndicator) => {
    // Set Notice First
    if (title) {
      this.refs.NoticePrompt.changeTitle(title);
    }

    if (subtitle) {
      this.refs.NoticePrompt.changeSubtitle(subtitle);
    }

    if (notice) {
      this.refs.NoticePrompt.changeNotice(notice);
    }

    if (showIndicator) {
      this.refs.NoticePrompt.changeIndicator(showIndicator);
    }

    // Set render state of this and the animate the blur modal in
    this.refs.OverlayBlur.changeRenderState(toggle, animate);
    this.refs.NoticePrompt.changeRenderState(toggle, animate);
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
  loadNextScreenAfterAdditionalSetup = async () => {
    // Check if biometric is present, if so present authentication
    // If authenticated, store the passcode on secure chain
    if (this.state.biometricSupported) {
      let biometricType = "Null";

      if (this.state.biometricSupported == LocalAuthentication.AuthenticationType.FINGERPRINT) {
        biometricType = "TouchID";
      }
      else if (this.state.biometricSupported == LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION) {
        biometricType = "FaceID";
      }

      const options = {};
      options.promptMessage = `Allow ${biometricType} to Authenticate you quickly and securely.`;
      options.cancelLabel = 'Skip for Now';
      options.fallbackLabel = '';
      options.disableDeviceFallback = true;

      const response = await LocalAuthentication.authenticateAsync(options);

      let biometricEnabled = false;
      if (response.success) {
        biometricEnabled = true;
      }

      if (biometricEnabled) {
        // Store passcode and encrypted private key in keychain
        const username = String(this.state.passcode);
        const password = String(this.state.encryptedPKey);
        const AUTH_OPTIONS = {
         accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_CURRENT_SET,
         accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED,
        }

        await Keychain.setGenericPassword(
          username,
          password,
          AUTH_OPTIONS
        );

        this.loadNextScreen();
      }
      else {
        // Display enabling push notification message and move on
        this.toggleNoticePrompt(
          true,
          true,
          `${biometricType} Skipped`,
          `${biometricType} is recommended for added security and to quickly authenticate you`,
          `If you wish to enable ${biometricType} in the future, you can do so from the [appsettings:App Settings]`,
          false
        );
      }
    }
    else {
      this.loadNextScreen();
    }
  }

  loadNextScreenSequential = () => {
    this.loadNextScreen();
  }

  loadNextScreen = async () => {
    // Goto Next Screen
    // Check if the push notification permission is waiting for first grant
    // If not, skip this step completely as user either gave permission or denied it
    const authorizationStatus = await messaging().hasPermission();
    const { privateKey } = this.props.route.params;

    if (authorizationStatus == messaging.AuthorizationStatus.NOT_DETERMINED) {
      this.props.navigation.navigate('PushNotify', {
        privateKey: privateKey,
      });
    }
    else {
      this.props.navigation.navigate('SetupComplete', {
        privateKey: privateKey,
      });
    }

  }

  // RETURN
  render() {
    const { navigation } = this.props;

    // Keyboard Behavior
    let keyboardAvoidBehavior = "padding";
    if (Platform.OS === 'android') {
      keyboardAvoidBehavior = "height";
    }

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

    // For Biometric Optional Prompt
    let continuePrompt = "Continue";
    let continueIcon = 'ios-arrow-forward';

    let biometricType = "Null";
    let biometricPrompt = '';

    if (this.state.biometricSupported) {
      if (this.state.biometricSupported == LocalAuthentication.AuthenticationType.FINGERPRINT) {
        biometricType = "TouchID";
      }
      else if (this.state.biometricSupported == LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION) {
        biometricType = "FaceID";
      }

      continueIcon = 'md-finger-print';
      continuePrompt = `Enable ${biometricType} and Continue`;

      biometricPrompt = `Enabling [bold:${biometricType} is optional] but further improves your security. It also gives you [default:fast and secure access].`
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

                if (this.refs.PasscodeInput) {
                  this.refs.PasscodeInput.focus();
                }
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
                      ? <KeyboardAvoidingView
                          style={styles.keyboardAvoid}
                          behavior={keyboardAvoidBehavior}
                          enabled
                        >
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
                        </KeyboardAvoidingView>
                      : this.state.pkeyEncrypted == false
                          ? <ActivityIndicator
                              style = {styles.activity}
                              size = "small"
                              color = {GLOBALS.COLORS.GRADIENT_THIRD}
                            />
                          : <React.Fragment>
                              <StylishLabel
                                style={styles.paracenter}
                                fontSize={24}
                                title="[Third:Passcode Set!]"
                              />
                              <StylishLabel
                                style={styles.para}
                                fontSize={16}
                                title="[default:Note:] Your passcode encrypts your data and even we can't recover it, Losing this means re-importing your wallet to access EPNS."
                              />
                              {
                                this.state.biometric == false
                                  ? null
                                  : <StylishLabel
                                      style={styles.para}
                                      fontSize={16}
                                      title={biometricPrompt}
                                    />
                              }
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
              this.state.pkeyEncrypted == false
                ? null
                : <View style={styles.verifyFooter}>
                    <React.Fragment>
                      <PrimaryButton
                        iconFactory='Ionicons'
                        icon={continueIcon}
                        iconSize={24}
                        title={continuePrompt}
                        fontSize={16}
                        fontColor={GLOBALS.COLORS.WHITE}
                        bgColor={GLOBALS.COLORS.GRADIENT_THIRD}
                        disabled={false}
                        onPress={() => {this.loadNextScreenAfterAdditionalSetup()}}
                      />
                    </React.Fragment>
                  </View>
            }


            <GetScreenInsets />
          </Animated.View>
        </SafeAreaView>

        {/* Overlay Blur and Notice to show in case biometric is skipped */}
        <OverlayBlur
          ref='OverlayBlur'
        />

        <NoticePrompt
          ref='NoticePrompt'
          closeTitle='OK'
          closeFunc={() => {
            this.toggleNoticePrompt(false, true);
            this.loadNextScreenSequential();
          }}
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
    backgroundColor: GLOBALS.COLORS.WHITE,
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
  paraend: {
    marginBottom: 0,
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
    color: GLOBALS.COLORS.TRANSPARENT,
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
