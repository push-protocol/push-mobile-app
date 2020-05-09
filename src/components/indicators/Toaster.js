import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  Animated,
  Dimensions,
  Text,
  Easing,
  TouchableWithoutFeedback,
  Platform,
} from 'react-native';

import SafeAreaView from 'react-native-safe-area-view';
import { Ionicons } from '@expo/vector-icons';

import MaskedView from '@react-native-community/masked-view';
import { LinearGradient } from 'expo-linear-gradient';

import GLOBALS from 'src/Globals';

const ToasterOptions = {
  TYPE: {
    GRADIENT_PRIMARY: 0,
    GRADIENT_SECONDARY: 1,
    GRADIENT_THIRD: 2,
    GRADIENTTEXT: 3,
    ERROR: 4,
  },
  DELAY: {
    LONG: 3500,
    SHORT: 2500,
  }
}

const MAX_HEIGHT = 40;

class Toaster extends Component<Prop> {
  // CONSTRUCTOR
  constructor(props) {
    super(props);

    this.state = {
      msg: 'Hello World!',
      icon: 'md-heart',
      type: ToasterOptions.TYPE.GRADIENTTEXT,

      translateY: new Animated.Value(0),
      render: true
    }

    // VARIABLES
    this._isMounted = false;
    this._timer = null;
  }

  // COMPONENT MOUNTED
  componentDidMount() {
    this._isMounted = true;

  }

  componentWillUnmount () {
    this._isMounted = false;
    this.clearTimer();
  }

  // FUNCTIONS
  // Show Toast
  showToaster = (msg, icon, type, hideAfterTime) => {
    this.setState({
      msg: msg,
      icon: icon,
      type: type,
    }, () => {
      this.changeRenderState(true, hideAfterTime);
    })
  }

  // Change Render
  changeRenderState = (shouldOpen, hideAfterTime) => {
    if (shouldOpen == true) {
      this.slideIn();

      let delayTime = ToasterOptions.DELAY.LONG;

      if (hideAfterTime) {
        delayTime = Number(hideAfterTime);
      }

      this._timer = setTimeout(() => {
        this.changeRenderState(false)
      }, delayTime);
    }
    else {
      this.slideOut();
    }
  }

  // Slide In / Out
  slideIn = () => {
    this.setState({
      render: true
    }, () => {
      if (this.props.onWillshowToasterCallback) {
        try {
          this.props.onWillshowToasterCallback();
        }
        catch (err) {
          console.warn("Error Calling onWillshowToasterCallback!");
          console.warn(err);
        }
      }
    });

    Animated.timing(
      this.state.translateY, {
        toValue: 1,
        easing: Easing.easeInOut,
        duration: 300
      }
    ).start(() => {
      if (this.props.onDidshowToasterCallback) {
        try {
          this.props.onDidshowToasterCallback();
        }
        catch (err) {
          console.warn("Error Calling onDidshowToasterCallback!");
          console.warn(err);
        }
      }
    });
  }

  slideOut = () => {
    this.clearTimer();

    if (this.props.onWillHideToastCallback) {
      try {
        this.props.onWillHideToastCallback();
      }
      catch (err) {
        console.warn("Error Calling onWillHideToastCallback!");
        console.warn(err);
      }
    }

    Animated.timing(
      this.state.translateY, {
        toValue: 0,
        easing: Easing.easeInOut,
        duration: 300
      }
    ).start(() => {
      this.setState({
        render: false
      });

      if (this.props.onDidHideToastCallback) {
        try {
          this.props.onDidHideToastCallback();
        }
        catch (err) {
          console.warn("Error Calling onDidHideToastCallback!");
          console.warn(err);
        }
      }
    });
  }

  // Clear Timer
  clearTimer () {
   // Handle an undefined timer rather than null
   this._timer !== undefined ? clearTimeout(this._timer) : null;
  }

  // To handle press in
  handleOnPress = () => {
    // Call on Tap Callback if there
    if (this.props.toastTappedCB) {
      try {
        this.props.toastTappedCB();
      }
      catch (err) {
        console.warn("Error Calling toastTappedCB!");
        console.warn(err);
      }
    }
    // Change Render State to false
    this.changeRenderState(false);
  }

  // To render icon
  renderInner = (msg, icon, type, iconStyle, iconFont) => {
    if (!icon || icon === "") {
      return (
        <Text style={styles.message}>{msg}</Text>
      );
    }
    else {
      return (
        <View style={styles.inner}>
          <View style={[ styles.iconstyle, iconStyle ]}>
            <Ionicons style={styles.icon} name={icon} size={iconFont} color={this.returnColor(this.state.type, false)} />
          </View>
          <Text style={styles.message}>{msg}</Text>
        </View>
      );
    }
  }

  // Return color for type
  returnColor = (type, forIcon) => {
    let color;

    switch (this.state.type) {
      case ToasterOptions.TYPE.GRADIENT_PRIMARY:
        color = GLOBALS.COLORS.GRADIENT_PRIMARY;
        break;

      case ToasterOptions.TYPE.PRIMARY_SECONDARY:
        color = GLOBALS.COLORS.GRADIENT_SECONDARY;
        break;

      case ToasterOptions.TYPE.THIRD_GRADIENT:
        color = GLOBALS.COLORS.GRADIENT_THIRD;
        break;

      case ToasterOptions.TYPE.GRADIENTTEXT:
        color = GLOBALS.COLORS.WHITE;
        if (forIcon) {
          color = GLOBALS.COLORS.BLACK;
        }
        break;

      case ToasterOptions.TYPE.ERROR:
        color = GLOBALS.COLORS.LIGHT_MAROON;
        break;

      default:
        color = GLOBALS.COLORS.GRADIENT_PRIMARY;
        break;
    }

    return color;
  }

  // RENDER
  render() {
    const {
      toastTappedCB,
      onWillshowToasterCallback,
      onDidshowToasterCallback,
      onWillHideToastCallback,
      onDidHideToastCallback,
    } = this.props;

    let addedBGContainerStyles = {};
    let iconStyle = {};
    let iconFont = 14;

    switch (this.state.type) {
      case ToasterOptions.TYPE.GRADIENT_PRIMARY:
        addedBGContainerStyles.backgroundColor = GLOBALS.COLORS.GRADIENT_PRIMARY;
        break;

      case ToasterOptions.TYPE.GRADIENT_SECONDARY:
        addedBGContainerStyles.backgroundColor = GLOBALS.COLORS.GRADIENT_SECONDARY;
        break;

      case ToasterOptions.TYPE.GRADIENT_THIRD:
        addedBGContainerStyles.backgroundColor = GLOBALS.COLORS.GRADIENT_THIRD;
        break;

      case ToasterOptions.TYPE.GRADIENTTEXT:
        addedBGContainerStyles.backgroundColor = GLOBALS.COLORS.WHITE;
        iconStyle = {
          backgroundColor: GLOBALS.COLORS.TRANSPARENT,
          marginRight: 5,
          paddingHorizontal: 2,
        }
        iconFont = 22;
        break;

      case ToasterOptions.TYPE.ERROR:
        addedBGContainerStyles.backgroundColor = GLOBALS.COLORS.LIGHT_MAROON;
        break;

      default:
        addedBGContainerStyles.backgroundColor = GLOBALS.COLORS.GRADIENT_PRIMARY;
        break;
    }

    return (
      this.state.render == false
        ? null
        : <TouchableWithoutFeedback
            onPress = {() => {
              this.handleOnPress()
            }}
          >
            <Animated.View
              style = {[
                styles.container,
                {
                  transform: [
                     {
                       translateY: this.state.translateY.interpolate({
                         inputRange: [0.2, 1],
                         outputRange: [100 * 1.5, 0]
                       })
                     }
                  ]
                }
               ]}
            >
              <View style={[ styles.content, addedBGContainerStyles ]}>
                {
                  this.state.type == ToasterOptions.TYPE.GRADIENTTEXT
                    ? <MaskedView
                        style={styles.maskedView}
                        maskElement={
                          this.renderInner(this.state.msg, this.state.icon, this.state.type, iconStyle, iconFont)
                        }
                      >
                        {this.renderInner(this.state.msg, this.state.icon, this.state.type, iconStyle, iconFont)}
                        <LinearGradient
                          colors={[
                            GLOBALS.COLORS.GRADIENT_PRIMARY,
                            GLOBALS.COLORS.GRADIENT_SECONDARY,
                            GLOBALS.COLORS.GRADIENT_THIRD,
                          ]}
                          style={[
                            styles.fullgradient,
                          ]}
                          start={[0.1, 0.3]}
                          end={[1, 1]}
                        >
                        </LinearGradient>
                      </MaskedView>
                    : this.renderInner(this.state.msg, this.state.icon, this.state.type, iconStyle, iconFont)
                }
              </View>
            </Animated.View>
          </TouchableWithoutFeedback>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 50,
    zIndex: 9999,

  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    shadowColor: GLOBALS.COLORS.BLACK,
    shadowOffset: {
    	width: 0,
    	height: 5,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,

    elevation: 6,
    borderRadius: 25,
  },
  inner: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  message: {
    color: GLOBALS.COLORS.WHITE,
    fontSize: 16,
    fontWeight: 'bold',
  },
  iconstyle: {
    backgroundColor: GLOBALS.COLORS.WHITE,
    paddingVertical: 2,
    paddingHorizontal: 5,
    borderRadius: 10,
    marginRight: 10,
  },
  icon: {
    paddingTop: 1,
  },
  maskedView: {
    flex: 1,
    flexDirection: 'row',
    height: '100%',
  },
  maskedElementView: {
    backgroundColor: 'white',
    flex: 1,
    alignItems: 'center',
  },
  fullgradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
  },
});

export { ToasterOptions, Toaster };
