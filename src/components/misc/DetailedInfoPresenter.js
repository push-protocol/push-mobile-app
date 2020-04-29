import React, { Component } from 'react';
import {
  View,
  Image,
  Animated,
  Easing,
  StyleSheet,
} from 'react-native';
import SafeAreaView from 'react-native-safe-area-view';

import GLOBALS from 'src/Globals';

export default class DetailedInfoPresenter extends Component {
  // CONSTRUCTOR
  constructor(props) {
    super(props);

    this.state = {
      y: 0,
      ay: new Animated.Value(0),
      fader: new Animated.Value(0),
    }
  }

  // COMPONENT UPDATED
  componentDidUpdate(prevProps) {
    if (this.props.animated == true && this.props.startAnimation !== prevProps.startAnimation) {
      this.showMessage(this.props.animationCompleteCallback);
    }
  }

  // VIEW RELATED
  findDimensions = (layout) => {
    const {height} = layout;
    const halfH = height/2;

    this.setState({
      y: halfH,
    }, () => {
      Animated.timing(this.state.ay, {
        toValue: halfH,
      	duration: 0
      }).start();
    });
  }

  // FUNCTIONS
  showMessage = (afterCallback) => {
    Animated.parallel([
      Animated.timing(this.state.ay, {
        toValue: 0,
        duration: 400
      }),
      Animated.sequence([
        Animated.delay(200),
        Animated.timing(this.state.fader, {
      		toValue: 1,
          easing: Easing.linear,
      		duration: 300
      	})
      ])
    ]).start(() => {
      if (afterCallback) {
        afterCallback();
      }
    });
  }

  // RENDER
  render() {
    const {
      style,
      icon,
      issvg,
      contentView,
      animated
    } = this.props;

    let logoStyle = {};
    let contentStyle = {};

    if (animated) {
      logoStyle = {
        transform: [{ translateY: this.state.ay }]
      }

      contentStyle = {opacity: this.state.fader}
    }

    return (
      <View style={[ styles.container, style ]}>

        <Animated.View
          style={[
            styles.logo,
            logoStyle,
          ]}
        >
          <Image
            style={styles.icon}
            source={require('assets/ui/fulllogo.png')}
          />
        </Animated.View>

        <Animated.View
          style={[ styles.content, contentStyle ]}
          onLayout={(event) => { this.findDimensions(event.nativeEvent.layout) }}
        >
          {contentView}
        </Animated.View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
  },
  content: {
    paddingVertical: 10,
  }
});
