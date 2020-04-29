import React, { Component, useRef } from 'react';
import {
  View,
  Text,
  Image,
  InteractionManager,
  Animated,
  StyleSheet,
} from 'react-native';
import SafeAreaView from 'react-native-safe-area-view';
import { useFocusEffect } from '@react-navigation/native';
import { useHeaderHeight } from '@react-navigation/stack';

import StylishLabel from 'src/components/labels/StylishLabel';
import DetailedInfoPresenter from 'src/components/misc/DetailedInfoPresenter';
import PrimaryButton from 'src/components/buttons/PrimaryButton';

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

export default class WelcomeScreen extends Component {
  // CONSTRUCTOR
  constructor(props) {
    super(props);

    this.state = {
      transitionFinished: false,
      fader: new Animated.Value(0)
    }
  }

  // FUNCTIONS
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
    // Goto Next Screen
    this.props.navigation.navigate('SignIn', {
    });
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
      <Text style={styles.header}>Welcome!</Text>
        <View style={styles.inner}>
          <DetailedInfoPresenter
            style={styles.intro}
            icon={require('assets/ui/fulllogo.png')}
            issvg={false}
            contentView={
              <View>
                <StylishLabel
                  style={styles.para}
                  fontSize={16}
                  title='Welcome to [bold:Ethereum Push Notifications Service] (EPNS).'
                />
                <StylishLabel
                  style={styles.para}
                  fontSize={16}
                  title='[bold:EPNS] is a an innovative way to recieve notifications from different [bolditalics:dApps] or [bolditalics:Smart Contracts]. Think notifications but coming from blockchain ecosystem.'
                />
                <StylishLabel
                  style={styles.para}
                  fontSize={16}
                  title='Visit [url:epns.io||https://epns.io] to learn more about it.'
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
            icon='ios-arrow-forward'
            iconSize={24}
            title='Continue'
            fontSize={16}
            fontColor={GLOBALS.COLORS.WHITE}
            bgColor={GLOBALS.COLORS.GRADIENT_THIRD}
            disabled={false}
            onPress={() => {this.loadNextScreen()}}
          />
        </Animated.View>
      </SafeAreaView>
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
    paddingBottom: 20,
  }
});
