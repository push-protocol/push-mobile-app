import React, { Component } from 'react';
import {
  StyleSheet,
  ActivityIndicator,
  View,
  Text,
  TouchableOpacity,
  Animated
} from 'react-native';
import { BlurView } from 'expo-blur';
import { getStatusBarHeight } from 'react-native-status-bar-height';

import GLOBALS from 'src/Globals';

export default class OverlayBlur extends Component {
  // Constructor
  constructor(props) {
    super(props);

    this.state = {
      fader: new Animated.Value(0),
      render: false,
      indicator: false
    }
  }

  // Set Loading
  changeIndicator = (showIndicator) => {
    this.setState({
      indicator: showIndicator
    })
  }

  // Set State
  changeRenderState = (shouldOpen, animate) => {
    if (shouldOpen == true) {
      this.animateFadeIn(animate);
    }
    else {
      this.animateFadeOut(animate);
    }
  }

  // Set Fade In and Fade Out Animation
  animateFadeIn = (animate) => {
    this.setState({
      render: true
    });

    if (animate) {
      Animated.timing(
        this.state.fader, {
          toValue: 1,
          duration: 250,
        }
      ).start();
    }
    else {
      this.setState({
          fader: new Animated.Value(1)
      })
    }

  }

  animateFadeOut = (animate) => {
    if (animate) {
      Animated.timing(
        this.state.fader, {
          toValue: 0,
          duration: 250,
        }
      ).start(() => {
        this.setState({
          render: false
        });
      });
    }
    else {
      this.setState({
          fader: new Animated.Value(0),
          render: false
      })
    }
  }

  //Render
  render() {
    const { tint } = this.props;

    return (
      this.state.render == false
        ? null
        : <Animated.View
            style = {[ styles.container, {opacity: this.state.fader} ]}>

            <BlurView
              tint="light"
              intensity = {130}
              style={[ styles.container ]}>

              {
                this.state.indicator == false
                ? null
                : <ActivityIndicator
                    style = {styles.activity}
                    size = "large"
                    color = {GLOBALS.COLORS.BLACK}
                  />
              }

            </BlurView>

          </Animated.View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
  },
  modal: {
    position: 'absolute',
    display: 'flex',
    alignSelf: 'center',
    width: '60%',
    maxWidth: 600,
    overflow: 'hidden',
    borderRadius: 10,
    borderColor: GLOBALS.COLORS.PRIMARY,
  },
  activity: {
    padding: 15
  },
});
