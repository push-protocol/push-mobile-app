import React, {Component} from 'react';
import {Animated, Easing, Image, StyleSheet, View} from 'react-native';

export default class DetailedInfoPresenter extends Component {
  // CONSTRUCTOR
  constructor(props) {
    super(props);

    this.state = {
      y: 0,
      ay: new Animated.Value(0),
      fader: new Animated.Value(0),
    };
  }

  // COMPONENT UPDATED
  componentDidUpdate(prevProps) {
    if (
      this.props.animated === true &&
      this.props.startAnimation !== prevProps.startAnimation
    ) {
      this.showMessage(this.props.animationCompleteCallback);
    }
  }

  // VIEW RELATED
  findDimensions = layout => {
    const {height} = layout;
    const halfH = height / 2;

    this.setState(
      {
        y: halfH,
      },
      () => {
        Animated.timing(this.state.ay, {
          toValue: halfH,
          duration: 0,
          useNativeDriver: true,
        }).start();
      },
    );
  };

  // FUNCTIONS
  showMessage = afterCallback => {
    Animated.parallel([
      Animated.timing(this.state.ay, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.delay(100),
        Animated.timing(this.state.fader, {
          toValue: 1,
          easing: Easing.linear,
          duration: 250,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      if (afterCallback) {
        afterCallback();
      }
    });
  };

  // RENDER
  render() {
    const {style, icon, contentView, animated} = this.props;

    let logoStyle = {};
    let contentStyle = {};

    if (animated) {
      logoStyle = {
        transform: [{translateY: this.state.ay}],
      };

      contentStyle = {opacity: this.state.fader};
    }

    return (
      <View style={[styles.container, style]}>
        <Animated.View style={[styles.logo, logoStyle]}>
          <Image style={styles.icon} source={icon} />
        </Animated.View>

        <Animated.View
          style={[styles.content, contentStyle]}
          onLayout={event => {
            this.findDimensions(event.nativeEvent.layout);
          }}>
          {contentView}
        </Animated.View>
      </View>
    );
  }
}

// Styling
const styles = StyleSheet.create({
  container: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: '100%',
    alignItems: 'center',
  },
  icon: {
    width: 184,
    height: 184,
    aspectRatio: 1,
    resizeMode: 'contain',
  },
  content: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
