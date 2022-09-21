import {BlurView} from 'expo-blur';
import React, {Component} from 'react';
import {
  ActivityIndicator,
  Animated,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import GLOBALS from 'src/Globals';

export default class OverlayBlur extends Component {
  // Constructor
  constructor(props) {
    super(props);

    this.state = {
      fader: new Animated.Value(0),
      render: false,
      indicator: false,
    };
  }

  // Set Loading
  changeIndicator = showIndicator => {
    this.setState({
      indicator: showIndicator,
    });
  };

  // Set State
  changeRenderState = (shouldOpen, animate) => {
    if (shouldOpen == true) {
      this.animateFadeIn(animate);
    } else {
      this.animateFadeOut(animate);
    }
  };

  // Set Fade In and Fade Out Animation
  animateFadeIn = animate => {
    this.setState({
      render: true,
    });

    if (animate) {
      Animated.timing(this.state.fader, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }).start();
    } else {
      this.setState({
        fader: new Animated.Value(1),
      });
    }
  };

  animateFadeOut = animate => {
    if (animate) {
      Animated.timing(this.state.fader, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start(() => {
        this.setState({
          render: false,
        });
      });
    } else {
      this.setState({
        fader: new Animated.Value(0),
        render: false,
      });
    }
  };

  //Render
  render() {
    const {tint, intensity, onPress} = this.props;

    let tinting = 'light';
    if (tint) {
      tinting = tint;
    }

    let intense = 130;
    if (intensity) {
      intense = intensity;
    }

    let disabled = true;
    let pressFunc = null;
    if (onPress) {
      disabled = false;
      pressFunc = onPress;
    }

    return this.state.render == false ? null : (
      <TouchableWithoutFeedback
        style={[styles.container]}
        onPress={pressFunc}
        disabled={disabled}>
        <Animated.View style={[styles.container, {opacity: this.state.fader}]}>
          <BlurView
            tint={tinting}
            intensity={intense}
            style={[styles.container]}>
            {this.state.indicator == false ? null : (
              <ActivityIndicator
                style={styles.activity}
                size="small"
                color={GLOBALS.COLORS.BLACK}
              />
            )}
          </BlurView>
        </Animated.View>
      </TouchableWithoutFeedback>
    );
  }
}

// Styling
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
    padding: 15,
  },
});
