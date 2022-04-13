import React, { Component } from 'react'
import {
  View,
  Text,
  Image,
  InteractionManager,
  Animated,
  AsyncStorage,
  StyleSheet,
} from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import { SafeAreaView, useSafeArea } from 'react-native-safe-area-context'

import StylishLabel from 'src/components/labels/StylishLabel'
import DetailedInfoPresenter from 'src/components/misc/DetailedInfoPresenter'
import PrimaryButton from 'src/components/buttons/PrimaryButton'

import GLOBALS from 'src/Globals'

function ScreenFinishedTransition({ setScreenTransitionAsDone }) {
  useFocusEffect(
    React.useCallback(() => {
      const task = InteractionManager.runAfterInteractions(() => {
        // After screen is loaded
        setScreenTransitionAsDone()
      })

      return () => task.cancel()
    }, []),
  )

  return null
}

function GetScreenInsets() {
  const insets = useSafeArea()
  if (insets.bottom > 0) {
    // Adjust inset by
    return <View style={styles.insetAdjustment}></View>
  } else {
    return <View style={styles.noInsetAdjustment}></View>
  }
}

export default class WelcomeScreen extends Component {
  // CONSTRUCTOR
  constructor(props) {
    super(props)

    this.state = {
      transitionFinished: false,
      detailedInfoPresetned: false,

      fader: new Animated.Value(0),
    }
  }

  // FUNCTIONS
  // When Animation is Finished
  animationFinished = () => {
    this.setState(
      {
        detailedInfoPresetned: true,
      },
      () => {
        Animated.timing(this.state.fader, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }).start()
      },
    )
  }

  // Load the Next Screen
  loadNextScreen = () => {
    // Goto Next Screen
    this.props.navigation.navigate('SignIn', {
      fromOnboarding: true,
    })
  }

  // RETURN
  render() {
    return (
      <SafeAreaView style={styles.container}>
        <ScreenFinishedTransition
          setScreenTransitionAsDone={() => {
            this.setState({
              transitionFinished: true,
            })
          }}
        />
        <Text style={styles.header}>Welcome!</Text>
        <View style={styles.inner}>
          <DetailedInfoPresenter
            style={styles.intro}
            icon={require('assets/ui/fulllogo.png')}
            contentView={
              <View style={styles.introContent}>
                <StylishLabel
                  style={styles.para}
                  fontSize={16}
                  title="Welcome to [b:Ethereum Push Notifications Service] (EPNS)."
                />
                <StylishLabel
                  style={styles.para}
                  fontSize={16}
                  title="[b:EPNS] is a an innovative way to recieve notifications from different [bi:dApps] or [bi:Smart Contracts]. Think notifications but coming from blockchain ecosystem."
                />
                <StylishLabel
                  style={styles.paraend}
                  fontSize={16}
                  title="Visit [u:epns.io||https://epns.io] to learn more about it."
                />
              </View>
            }
            animated={!this.state.detailedInfoPresetned}
            startAnimation={this.state.transitionFinished}
            animationCompleteCallback={() => {
              this.animationFinished()
            }}
          />
        </View>
        <Animated.View style={[styles.footer, { opacity: this.state.fader }]}>
          <PrimaryButton
            iconFactory="Ionicons"
            icon="ios-arrow-forward"
            iconSize={24}
            title="Continue"
            fontSize={16}
            fontColor={GLOBALS.COLORS.WHITE}
            bgColor={GLOBALS.COLORS.GRADIENT_THIRD}
            disabled={false}
            onPress={() => {
              this.loadNextScreen()
            }}
          />
          <GetScreenInsets />
        </Animated.View>
      </SafeAreaView>
    )
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
  },
})
