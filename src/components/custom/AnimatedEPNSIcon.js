import React, {Component} from 'react';
import {View, Image, Animated, Easing, StyleSheet} from 'react-native';

export default class AnimatedEPNSIcon extends Component {
  // CONSTRUCTOR
  constructor(props) {
    super(props);

    // Set State
    this.state = {
      rotateAnimation: new Animated.Value(0),
    };
  }

  // COMPONENT MOUNTED
  componentDidMount() {}

  // FUNCTIONS
  animateBell = afterCallback => {
    Animated.sequence([
      Animated.timing(this.state.rotateAnimation, {
        toValue: 1,
        duration: 40,
        easing: Easing.spring,
        useNativeDriver: true,
      }),
      Animated.timing(this.state.rotateAnimation, {
        toValue: -1,
        duration: 80,
        easing: Easing.spring,
        useNativeDriver: true,
      }),
      Animated.timing(this.state.rotateAnimation, {
        toValue: 0.5,
        duration: 60,
        easing: Easing.spring,
        useNativeDriver: true,
      }),
      Animated.timing(this.state.rotateAnimation, {
        toValue: -0.5,
        duration: 80,
        easing: Easing.spring,
        useNativeDriver: true,
      }),
      Animated.timing(this.state.rotateAnimation, {
        toValue: 0,
        duration: 40,
        easing: Easing.spring,
        useNativeDriver: true,
      }),
      Animated.delay(100),
    ]).start(() => {
      // Callback to handle after animation
      if (afterCallback) {
        afterCallback();
      }
    });
  };

  // RENDER
  render() {
    const {style, withoutRinger} = this.props;

    var rotateProp = this.state.rotateAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '15deg'],
    });

    return (
      <View style={[styles.container, style]}>
        <Animated.View
          style={[
            styles.inner,
            {
              transform: [
                {
                  rotate: rotateProp,
                },
              ],
            },
          ]}>
          <Image style={[styles.bell]} source={require('assets/ui/bell.png')} />
        </Animated.View>

        {withoutRinger == true ? null : (
          <Image
            style={[styles.ringer, styles.absimg]}
            source={require('assets/ui/ring.png')}
          />
        )}

        <Image
          style={[styles.bellball, styles.absimg]}
          source={require('assets/ui/bellball.png')}
        />
      </View>
    );
  }
}

// Styling
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  bell: {
    width: '100%',
    resizeMode: 'contain',
  },
  absimg: {
    width: '100%',
    position: 'absolute',
    resizeMode: 'contain',
  },
});
