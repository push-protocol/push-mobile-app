import React, { Component, useState } from 'react';
import {
  View,
  TouchableWithoutFeedback,
  Text,
  Animated,
  Easing,
  StyleSheet
} from 'react-native';
import {
  Ionicons,
} from '@expo/vector-icons';

import GLOBALS from 'src/Globals';

export default class PrimaryButton extends Component {
  // Constructor
  constructor(props) {
    super(props);

    this.state = {
      bgColor: GLOBALS.COLORS.BLACK,
      fadeColor: GLOBALS.COLORS.DARK_GRAY,

      fontColor: GLOBALS.COLORS.WHITE,
      toggleOverlay: false,
    }

    this.AnimatedColor = new Animated.Value(0);
  }

  // COMPONENT MOUNTED
  componentDidMount() {
    // Update Colors
    const { bgColor, fontColor } = this.props;
    this.updateColors(bgColor, fontColor);
  }

  // COMPONENT UPDATED
  componentDidUpdate(prevProps) {
    if (
      this.props.bgColor !== prevProps.bgColor
      || this.props.fontColor !== prevProps.fontColor
    ) {
      const { bgColor, fontColor } = this.props;
      this.updateColors(bgColor, fontColor);
    }
  }

  // Update Color
  updateColors = (bgColor, fontColor) => {
    this.setState({
      bgColor: bgColor,
      fontColor: fontColor,
    });
  }

  // Change Button Color
  setButtonColors = (newBgColor, newFontColor) => {
    let bgColor = this.state.bgColor;
    let fontColor = this.state.fontColor;

    if (newBgColor != null) {
      bgColor = newBgColor;
    }

    if (newFontColor != null) {
      fontColor = newFontColor;
    }

    this.updateColors(bgColor, fontColor);
  }

  // Change Button Color with Animation
  fadeFromToWithTime = (oldBGColor, newBgColor, time) => {
    let animTime = 250;
    if (time) {
      animTime = time;
    }

    this.setState({
      bgColor: oldBGColor,
      fadeColor: newBgColor,
    }, () => {
      Animated.timing(this.AnimatedColor, {
        toValue: 100,
        Easing: Easing.easeInOut,
        duration: animTime
      }).start(() => {

        this.setState({
          bgColor: newBgColor,
          fadeColor: newBgColor,
        }, () => {
          this.AnimatedColor = new Animated.Value(0);
        });

      });
    });
  }

  // Change State to refresh Color
  toggleOverlay = (toggle) => {
    this.setState({
      toggleOverlay: toggle
    });
  };

  // Render Icon
  renderIcon = (iconFactory, icon, color, size) => {
    // Need to import to enable them
    switch (iconFactory) {
      case 'FontAwesome':
        Factory = FontAwesome;
        break;
      case 'FontAwesome5':
        Factory = FontAwesome5;
        break;
      case 'EvilIcons':
        Factory = EvilIcons;
        break;
      case 'MaterialCommunityIcons':
        Factory = MaterialCommunityIcons;
        break;
      default:
        Factory = Ionicons;
    }

    return (
      <Factory
        name = {icon}
        color = {color}
        size = {size}
      />
    );
  }

  // Set Render
  render() {
    const {
      style,
      iconFactory,
      icon,
      iconSize,
      title,
      fontSize,
      disabled,
      onPress
    } = this.props;

    // for updating style
    let updatedButtonStyle = {};

    let fontStyle = {
      color: this.state.fontColor,
      fontSize: fontSize
    }

    // For constructing color
    let interpolateColor = this.AnimatedColor.interpolate({
      inputRange: [0, 100],
      outputRange: [this.state.bgColor, this.state.fadeColor]
    })

    const animatedStyle = {
      backgroundColor: interpolateColor,
    }

    updatedButtonStyle.backgroundColor = this.state.bgColor;

    return (
      <View style={[ style, styles.outerContainer ]}>
        <TouchableWithoutFeedback
          onPress = {onPress}
          onPressIn = {() => this.toggleOverlay(true)}
          onPressOut = {() => this.toggleOverlay(false)}
          onPress = {onPress}
          disabled = {disabled}
        >
          <Animated.View
            style = {[
              styles.innerContainer,
              updatedButtonStyle,
              animatedStyle
            ]}
          >
            {
              this.state.toggleOverlay == false
                ? null
                : <View style = {styles.overlayContainer}></View>
            }
            <Text style = {[styles.title, fontStyle ]}>{title}</Text>
            {
              this.renderIcon(
                iconFactory,
                icon,
                this.state.fontColor,
                iconSize,
              )
            }
          </Animated.View>
        </TouchableWithoutFeedback>
      </View>
    );
  };
}

const styles = StyleSheet.create({
  outerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
    borderRadius: 8,
    overflow: 'hidden',
    width: '100%',
  },
  overlayContainer: {
    position: 'absolute',
    ...StyleSheet.absoluteFill,
    backgroundColor: GLOBALS.COLORS.LIGHT_BLACK_TRANS,
  },
  title: {
    fontSize: 12,
    paddingRight: 10,
    color: GLOBALS.COLORS.WHITE,
    justifyContent: 'center',
    alignItems: 'center',
  }
});
