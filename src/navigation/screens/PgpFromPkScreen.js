import * as LocalAuthentication from 'expo-local-authentication';
import React, {Component} from 'react';
import {
  Animated,
  Easing,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  Vibration,
  View,
} from 'react-native';
import * as Keychain from 'react-native-keychain';
import {connect} from 'react-redux';
import GLOBALS from 'src/Globals';
import PrimaryButton from 'src/components/buttons/PrimaryButton';
import AnimatedEPNSIcon from 'src/components/custom/AnimatedEPNSIcon';
import StylishLabel from 'src/components/labels/StylishLabel';
import DetailedInfoPresenter from 'src/components/misc/DetailedInfoPresenter';
import AuthenticationHelper from 'src/helpers/AuthenticationHelper';
import BiometricHelper from 'src/helpers/BiometricHelper';
import {setAllUsers, setAuthState, switchUser} from 'src/redux/authSlice';
import MetaStorage from 'src/singletons/MetaStorage';

// FOR SLIDING UP ANIMATION
const SLIDE_UP_THRESHOLD = 100;

// FOR SLIDING UP ANIMATION

class SplashScreen extends Component {
  // CONSTRUCTOR
  constructor(props) {
    super(props);

    this.state = {
      signedIn: false,
      passcodePrompt: false,
      userLocked: false,

      passcode: '',
      remainingAttempts: 0,

      signedInFader: new Animated.Value(1),
      passcodeFader: new Animated.Value(1),
      passcodePromptFader: new Animated.Value(0),
      userLockedFader: new Animated.Value(0),

      resetWalletFader: new Animated.Value(1),
    };

    this.PasscodeInput = React.createRef();
  }

  // COMPONENT MOUNTED
  async componentDidMount() {
    console.log('Splash screen comes');
    const signedIn = this.props.auth.isLoggedIn;
    console.log('Signed in: ', signedIn);
    if (!signedIn) {
      const wallet = await MetaStorage.instance.getStoredWallets();
      console.log('Walletssss: ', wallet);
      if (wallet && wallet.length > 0) {
        this.setState(
          {
            signedIn: true,
          },
          () => {
            this.handleAuthenticationFlow(signedIn);
          },
        );
      } else {
        // Do The Bell Once and then proceed
        this.refs.bellicon.animateBell(() => {
          this.props.dispatch(setAuthState(GLOBALS.AUTH_STATE.ONBOARDING));
        });
      }
    } else {
      // User is signed in, handle Authentication flow
      this.setState(
        {
          signedIn: true,
        },
        () => {
          this.handleAuthenticationFlow(signedIn);
        },
      );
    }
  }

  setNewState = async () => {
    const wallet = await MetaStorage.instance.getStoredWallets();
    this.props.dispatch(setAllUsers(wallet));
    this.props.dispatch(switchUser(0));
  };

  // FUNCTIONS
  // To Handle the logic flow
  handleAuthenticationFlow = async signedIn => {
    // Check for Account Lock First
    const userLocked = await MetaStorage.instance.getUserLocked();
    if (!userLocked) {
      // Present Secuity Details
      this.handleAuthentication(signedIn);
    } else {
      this.transitionToUserLocked(true);
    }
  };

  // To Handle Authentication
  handleAuthentication = async signedIn => {
    // First try biometric
    const response = await this.authenticateViaBiometric();

    if (response.success) {
      // Do The Bell Once and then proceed

      await this.setNewState();
      this.refs.bellicon.animateBell(() => {
        this.props.dispatch(setAuthState(GLOBALS.AUTH_STATE.AUTHENTICATED));
      });
    } else {
      // Verify
      const passcodeAttemptsPending = await this.checkAndTakeActionOnAttempts(
        true,
      );

      if (passcodeAttemptsPending) {
        // Set State
        this.setState(
          {
            remainingAttempts: passcodeAttemptsPending,
          },
          () => {
            this.transitionToPasscodeAttempts();
          },
        );
      }
    }
  };

  // To Handle Authentication via biometric
  authenticateViaBiometric = async () => {
    let response = {};

    // Check if biometric is available
    const biometricSupported = await BiometricHelper.getSupportedBiometric();

    if (biometricSupported) {
      let biometricType = 'Null';

      if (
        biometricSupported ===
        LocalAuthentication.AuthenticationType.FINGERPRINT
      ) {
        biometricType = 'TouchID';
      } else if (
        biometricSupported ===
        LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION
      ) {
        biometricType = 'FaceID';
      }

      try {
        const title = `Signing you with ${biometricType}`;
        const cancel = 'Use Passcode';

        const AUTH_OPTIONS = {
          authenticationPrompt: {
            title: title,
            cancel: cancel,
          },
        };

        // Retrieve the credentials
        const credentials = await Keychain.getGenericPassword(AUTH_OPTIONS);

        if (credentials) {
          const hashedCode = await MetaStorage.instance.getHashedPasscode();
          const signedInType = await MetaStorage.instance.getSignedInType();

          let authResponse = await AuthenticationHelper.getCodeVerification(
            credentials.username,
            hashedCode,
          );
          if (signedInType === GLOBALS.CONSTANTS.CRED_TYPE_WALLET) {
            authResponse = await AuthenticationHelper.getCodeVerification(
              credentials.username,
              hashedCode,
            );
          } else if (signedInType === GLOBALS.CONSTANTS.CRED_TYPE_PRIVATE_KEY) {
            authResponse = await AuthenticationHelper.returnDecryptedPKey(
              credentials.password,
              credentials.username,
              hashedCode,
            );
          }

          if (authResponse.success) {
            response.success = true;
            response.wallet = authResponse.wallet;
            response.pkey = authResponse.pkey;
          } else {
            response.success = false;
            response.info = pkey;
          }
        } else {
          response.success = false;
          response.info = 'Biometric failed';
        }
      } catch (error) {
        response.success = false;
        response.info = 'Biometric failed';
      }

      return response;
    } else {
      response.success = false;
      response.info = 'Biometric failed';
    }

    // Return Appropriate Response
    return response;
  };

  // To Handle Authentication via passcode
  authenticateViaPasscode = async value => {
    if (value.length !== 6) {
      // if the value isn't equal to 6, it's not complete yet
      return;
    }

    // Check if Passcode decrypts the key
    const hashedCode = await MetaStorage.instance.getHashedPasscode();
    const signedInType = await MetaStorage.instance.getSignedInType();

    let response = await AuthenticationHelper.getCodeVerification(
      value,
      hashedCode,
    );

    if (signedInType === GLOBALS.CONSTANTS.CRED_TYPE_WALLET) {
      response = await AuthenticationHelper.getCodeVerification(
        value,
        hashedCode,
      );
    } else if (signedInType === GLOBALS.CONSTANTS.CRED_TYPE_PRIVATE_KEY) {
      const encryptedPKey = await MetaStorage.instance.getEncryptedPkey();
      response = await AuthenticationHelper.returnDecryptedPKey(
        encryptedPKey,
        value,
        hashedCode,
      );
    }

    if (response.success) {
      // Move to the next page
      const {navigation} = this.props.route.params;
      navigation.navigate(GLOBALS.SCREENS.CHATPROFILESCREEN, {
        navigation: navigation,
        pkey: response.pkey,
        wallet: response.wallet,
      });
    } else {
      // Passcode Attempt Failed
      // Vibrate to indicate incorrect attempt
      Vibration.vibrate();

      // decrement the remaining attempts
      const remainingAttempts = GLOBALS.CONSTANTS.MAX_PASSCODE_ATTEMPTS;

      await MetaStorage.instance.setRemainingPasscodeAttempts(
        remainingAttempts,
      );
      const passcodeAttemptsPending = await this.checkAndTakeActionOnAttempts();

      if (passcodeAttemptsPending) {
        const callback = () => {
          this.setState(
            {
              remainingAttempts: remainingAttempts,
              passcode: '',
            },
            () => {},
          );
        };

        this.fadeInPasscode(callback);
      } else {
        this.setState({
          remainingAttempts: 0,
          passcode: '',
        });

        await this.checkAndTakeActionOnAttempts();
      }
    }
  };

  // To transition to Passcode Attempts
  transitionToPasscodeAttempts = () => {
    Animated.parallel([
      Animated.timing(this.state.signedInFader, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(this.state.passcodePromptFader, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start(() => {
      this.setState(
        {
          signedIn: false,
          passcodePrompt: true,
          userLocked: false,
        },
        () => {
          if (this.PasscodeInput) {
            this.PasscodeInput.current.focus();
          }
        },
      );
    });
  };

  // Set Pass Code
  changePassCode = value => {
    // accept only digits
    if (/^\d+$/.test(value) || value === '') {
      this.setState(
        {
          passcode: value,
        },
        () => {
          this.authenticateViaPasscode(value);
        },
      );
    }
  };

  // Check Passcode Attempts
  checkAndTakeActionOnAttempts = async jumpFromSignedInToLocked => {
    const remainingAttempts =
      await MetaStorage.instance.getRemainingPasscodeAttempts();

    if (remainingAttempts <= 0) {
      // Lock User Account
      await AuthenticationHelper.wipeSignedInUser();

      this.setState(
        {
          signedIn: false,
          passcodePrompt: false,
          userLocked: true,
        },
        () => {
          this.transitionToUserLocked(false);
        },
      );
    }

    return remainingAttempts;
  };

  // Fade In Passcode
  fadeInPasscode = callback => {
    this.setState(
      {
        passcodeFader: new Animated.Value(0),
      },
      () => {
        if (callback) {
          callback();
        }

        Animated.timing(this.state.passcodeFader, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }).start();
      },
    );
  };

  // Show Reset Wallet
  fadeInResetWallet = () => {
    Animated.timing(this.state.resetWalletFader, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start();
  };

  // Transition to User Locked
  transitionToUserLocked = directlyFromSignIn => {
    if (directlyFromSignIn) {
      Animated.parallel([
        Animated.timing(this.state.signedInFader, {
          toValue: 0,
          easing: Easing.easeOut,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(this.state.userLockedFader, {
          toValue: 1,
          easing: Easing.easeIn,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start(() => {
        this.setState({
          signedIn: false,
          passcodePrompt: false,
          userLocked: true,
        });
      });
    } else {
      Keyboard.dismiss();

      Animated.parallel([
        Animated.timing(this.state.passcodePromptFader, {
          toValue: 0,
          easing: Easing.easeOut,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(this.state.userLockedFader, {
          toValue: 1,
          easing: Easing.easeIn,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start(() => {
        this.setState({
          signedIn: false,
          passcodePrompt: false,
          userLocked: true,
        });
      });
    }
  };

  // Reset Wallet
  resetWallet = async () => {
    await AuthenticationHelper.resetSignedInUser();
    this.props.dispatch(setAuthState(GLOBALS.AUTH_STATE.ONBOARDING));
  };

  // RENDER
  render() {
    const passcodeSegment = this.state.passcode.split('');

    // Keyboard Behavior
    let keyboardAvoidBehavior = 'padding';
    if (Platform.OS === 'android') {
      keyboardAvoidBehavior = 'height';
    }

    // Customize Prompt
    let prompt = '[d:Please enter your Passcode]';
    const maxAttempts = GLOBALS.CONSTANTS.MAX_PASSCODE_ATTEMPTS;
    if (this.state.remainingAttempts < maxAttempts) {
      prompt = `[t:Incorrect Password, ${this.state.remainingAttempts} attempts pending]`;
    }

    return (
      <View style={styles.container}>
        {/* SignedInView or Default View, not in safe view to match splash screen */}
        <View style={styles.innerWrapper}>
          <Animated.View
            style={[
              styles.inner,
              styles.signedInView,
              {
                opacity: this.state.signedInFader,
                transform: [
                  {
                    translateY: this.state.signedInFader.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-SLIDE_UP_THRESHOLD * 1.25, 0],
                    }),
                  },
                ],
              },
            ]}>
            <AnimatedEPNSIcon ref="bellicon" style={styles.logo} />
          </Animated.View>
        </View>

        <View style={styles.safeContainer}>
          {/* passcode view */}
          <View style={styles.innerWrapper}>
            <Animated.View
              style={[
                styles.inner,
                styles.passcodePromptView,
                {
                  opacity: this.state.passcodePromptFader,
                  transform: [
                    {
                      translateY: this.state.passcodePromptFader.interpolate({
                        inputRange: [0.4, 1],
                        outputRange: [SLIDE_UP_THRESHOLD, 0],
                      }),
                    },
                  ],
                },
              ]}>
              <DetailedInfoPresenter
                style={styles.intro}
                icon={require('assets/ui/biometric.png')}
                contentView={
                  <View style={styles.introContent}>
                    <Animated.View style={styles.passcodeContainer}>
                      <KeyboardAvoidingView
                        style={styles.keyboardAvoid}
                        behavior={keyboardAvoidBehavior}
                        enabled>
                        <View style={styles.introContentInner}>
                          <StylishLabel
                            style={[styles.paracenter, styles.paraExtraMargin]}
                            fontSize={16}
                            title={prompt}
                          />

                          <TextInput
                            ref={this.PasscodeInput}
                            style={styles.input}
                            maxLength={6}
                            contextMenuHidden={true}
                            keyboardType={'numeric'}
                            autoCorrect={false}
                            onChangeText={value => this.changePassCode(value)}
                            value={this.state.passcode}
                          />

                          <View
                            style={styles.fancyTextContainer}
                            pointerEvents="none">
                            <View
                              style={[
                                styles.fancyTextView,
                                styles.fancyTextViewPrimary,
                              ]}>
                              <Text
                                style={[
                                  styles.fancyText,
                                  styles.fancyTextPrimary,
                                ]}>
                                {passcodeSegment[0]}
                              </Text>
                            </View>
                            <View
                              style={[
                                styles.fancyTextView,
                                styles.fancyTextViewPrimary,
                              ]}>
                              <Text
                                style={[
                                  styles.fancyText,
                                  styles.fancyTextPrimary,
                                ]}>
                                {passcodeSegment[1]}
                              </Text>
                            </View>
                            <View
                              style={[
                                styles.fancyTextView,
                                styles.fancyTextViewThird,
                              ]}>
                              <Text
                                style={[
                                  styles.fancyText,
                                  styles.fancyTextThird,
                                ]}>
                                {passcodeSegment[2]}
                              </Text>
                            </View>
                            <View
                              style={[
                                styles.fancyTextView,
                                styles.fancyTextViewThird,
                              ]}>
                              <Text
                                style={[
                                  styles.fancyText,
                                  styles.fancyTextThird,
                                ]}>
                                {passcodeSegment[3]}
                              </Text>
                            </View>
                            <View
                              style={[
                                styles.fancyTextView,
                                styles.fancyTextViewSecondary,
                              ]}>
                              <Text
                                style={[
                                  styles.fancyText,
                                  styles.fancyTextSecondary,
                                ]}>
                                {passcodeSegment[4]}
                              </Text>
                            </View>
                            <View
                              style={[
                                styles.fancyTextView,
                                styles.fancyTextViewSecondary,
                              ]}>
                              <Text
                                style={[
                                  styles.fancyText,
                                  styles.fancyTextSecondary,
                                ]}>
                                {passcodeSegment[5]}
                              </Text>
                            </View>
                          </View>
                        </View>
                      </KeyboardAvoidingView>
                    </Animated.View>
                  </View>
                }
                animated={false}
                startAnimation={false}
              />
            </Animated.View>
          </View>

          {/* locked user view */}
          <View style={styles.innerWrapper}>
            <Animated.View
              style={[
                styles.inner,
                styles.userLockedView,
                {
                  opacity: this.state.userLockedFader,
                  transform: [
                    {
                      translateY: this.state.userLockedFader.interpolate({
                        inputRange: [0.4, 1],
                        outputRange: [SLIDE_UP_THRESHOLD, 0],
                      }),
                    },
                  ],
                },
              ]}>
              <DetailedInfoPresenter
                style={styles.intro}
                icon={require('assets/ui/brokenkey.png')}
                contentView={
                  <View style={styles.introContent}>
                    <StylishLabel
                      style={styles.paracenter}
                      fontSize={24}
                      title="[t:Credentials Wiped]"
                    />
                    <StylishLabel
                      style={styles.para}
                      fontSize={16}
                      title="You ([d:or someone else]) exceeded the [b:passcode limit] to access your credentials."
                    />
                    <StylishLabel
                      style={styles.para}
                      fontSize={16}
                      title="Push (EPNS) has [d:completely wiped] your credentials in order to preserve the integrity of your wallet."
                    />
                    <StylishLabel
                      style={styles.paraend}
                      fontSize={16}
                      title="[d:Don't Sweat!:] Your messages are on [t:blockchain :)]. Just sign back in to gain access to them."
                    />
                  </View>
                }
                animated={false}
                startAnimation={false}
              />

              {/* For the Footer Area */}
              <PrimaryButton
                style={styles.resetButton}
                iconFactory="Ionicons"
                icon="ios-refresh"
                iconSize={24}
                title="Reset / Use Different Wallet"
                fontSize={16}
                fontColor={GLOBALS.COLORS.WHITE}
                bgColor={GLOBALS.COLORS.GRADIENT_PRIMARY}
                disabled={false}
                onPress={() => {
                  this.resetWallet();
                }}
              />
            </Animated.View>
          </View>
        </View>
      </View>
    );
  }
}

const mapStateToProps = state => ({
  auth: state.auth,
});

export default connect(mapStateToProps)(SplashScreen);

// Styling
const styles = StyleSheet.create({
  container: {
    height: '100%',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: GLOBALS.COLORS.WHITE,
  },
  logo: {
    width: 96,
    resizeMode: 'contain',
  },
  safeContainer: {
    height: '100%',
    width: '100%',
  },
  innerWrapper: {
    position: 'absolute',
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inner: {
    flexGrow: 1,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    maxWidth: 540,
  },
  signedInView: {},
  passcodePromptView: {
    width: '100%',
  },
  userLockedView: {
    width: '100%',
  },
  intro: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  introContent: {
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  introContentInner: {
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
  },
  passcodeContainer: {
    alignSelf: 'stretch',
    alignItems: 'stretch',
    justifyContent: 'center',
  },
  paraExtraMargin: {
    marginTop: 20,
  },
  para: {
    width: '100%',
    marginBottom: 20,
  },
  paracenter: {
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  paraleft: {
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  paraend: {
    width: '100%',
    marginBottom: 0,
  },
  input: {
    width: '100%',
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
    flexDirection: 'row',
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
  resetButton: {
    marginTop: 20,
    width: '100%',
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
  },
});
