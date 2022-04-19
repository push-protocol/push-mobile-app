import React, { Component } from 'react'
import {
  View,
  Animated,
  TextInput,
  Text,
  Easing,
  Platform,
  Keyboard,
  KeyboardAvoidingView,
  Vibration,
  StyleSheet,
} from 'react-native'

import * as LocalAuthentication from 'expo-local-authentication'
import * as Keychain from 'react-native-keychain'

import AnimatedEPNSIcon from 'src/components/custom/AnimatedEPNSIcon'

import StylishLabel from 'src/components/labels/StylishLabel'
import DetailedInfoPresenter from 'src/components/misc/DetailedInfoPresenter'
import PrimaryButton from 'src/components/buttons/PrimaryButton'

import AuthenticationHelper from 'src/helpers/AuthenticationHelper'
import BiometricHelper from 'src/helpers/BiometricHelper'
import MetaStorage from 'src/singletons/MetaStorage'

import GLOBALS from 'src/Globals'
import { connect } from 'react-redux'
import { setAuthState } from 'src/redux/authSlice'

// FOR SLIDING UP ANIMATION
const SLIDE_UP_THRESHOLD = 100

class SplashScreen extends Component {
  // CONSTRUCTOR
  constructor(props) {
    super(props)

    this.state = {
      passcodePrompt: false,
      userLocked: false,

      passcode: '',
      remainingAttempts: 0,

      signedInFader: new Animated.Value(1),
      passcodeFader: new Animated.Value(1),
      passcodePromptFader: new Animated.Value(0),
      userLockedFader: new Animated.Value(0),

      resetWalletFader: new Animated.Value(1),
    }
  }

  // COMPONENT MOUNTED
  async componentDidMount() {
    const signedIn = this.props.auth.isLoggedIn

    if (!signedIn) {
      console.log('User is not signed in')
      // Sign In is the first step, don't proceed ahead
      // Just Flip the switch
      // Do The Bell Once and then proceed

      this.refs.bellicon.animateBell(() => {
        this.props.dispatch(setAuthState(GLOBALS.AUTH_STATE.ONBOARDING))
      })

      // this.props.navigation.navigate(GLOBALS.SCREENS.WELCOME)
    } else {
      console.log('User is signed in')
      // User is signed in, handle Authentication flow
      // this.handleAuthenticationFlow(signedIn)
    }
  }

  // RENDER
  render() {
    const passcodeSegment = this.state.passcode.split('')

    // Keyboard Behavior
    let keyboardAvoidBehavior = 'padding'
    if (Platform.OS === 'android') {
      keyboardAvoidBehavior = 'height'
    }

    // Customize Prompt
    let prompt = '[d:Please enter your Passcode]'

    if (
      this.state.remainingAttempts < GLOBALS.CONSTANTS.MAX_PASSCODE_ATTEMPTS
    ) {
      prompt = `[t:Incorrect Password, ${this.state.remainingAttempts} attempts pending]`
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
            ]}
          >
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
              ]}
            >
              <DetailedInfoPresenter
                style={styles.intro}
                icon={require('assets/ui/biometric.png')}
                contentView={
                  <View style={styles.introContent}>
                    <Animated.View style={styles.passcodeContainer}>
                      <KeyboardAvoidingView
                        style={styles.keyboardAvoid}
                        behavior={keyboardAvoidBehavior}
                        enabled
                      >
                        <View style={styles.introContentInner}>
                          <StylishLabel
                            style={[styles.paracenter, styles.paraExtraMargin]}
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
                            onChangeText={(value) => this.changePassCode(value)}
                            value={this.state.passcode}
                          />

                          <View
                            style={styles.fancyTextContainer}
                            pointerEvents="none"
                          >
                            <View
                              style={[
                                styles.fancyTextView,
                                styles.fancyTextViewPrimary,
                              ]}
                            >
                              <Text
                                style={[
                                  styles.fancyText,
                                  styles.fancyTextPrimary,
                                ]}
                              >
                                {passcodeSegment[0]}
                              </Text>
                            </View>
                            <View
                              style={[
                                styles.fancyTextView,
                                styles.fancyTextViewPrimary,
                              ]}
                            >
                              <Text
                                style={[
                                  styles.fancyText,
                                  styles.fancyTextPrimary,
                                ]}
                              >
                                {passcodeSegment[1]}
                              </Text>
                            </View>
                            <View
                              style={[
                                styles.fancyTextView,
                                styles.fancyTextViewThird,
                              ]}
                            >
                              <Text
                                style={[
                                  styles.fancyText,
                                  styles.fancyTextThird,
                                ]}
                              >
                                {passcodeSegment[2]}
                              </Text>
                            </View>
                            <View
                              style={[
                                styles.fancyTextView,
                                styles.fancyTextViewThird,
                              ]}
                            >
                              <Text
                                style={[
                                  styles.fancyText,
                                  styles.fancyTextThird,
                                ]}
                              >
                                {passcodeSegment[3]}
                              </Text>
                            </View>
                            <View
                              style={[
                                styles.fancyTextView,
                                styles.fancyTextViewSecondary,
                              ]}
                            >
                              <Text
                                style={[
                                  styles.fancyText,
                                  styles.fancyTextSecondary,
                                ]}
                              >
                                {passcodeSegment[4]}
                              </Text>
                            </View>
                            <View
                              style={[
                                styles.fancyTextView,
                                styles.fancyTextViewSecondary,
                              ]}
                            >
                              <Text
                                style={[
                                  styles.fancyText,
                                  styles.fancyTextSecondary,
                                ]}
                              >
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
              ]}
            >
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
                      title="EPNS has [d:completely wiped] your credentials in order to preserve the integrity of your wallet."
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
                  this.resetWallet()
                }}
              />
            </Animated.View>
          </View>
        </View>
      </View>
    )
  }
}

const mapStateToProps = (state) => ({
  auth: state.auth,
})

export default connect(mapStateToProps)(SplashScreen)

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
})
