import {
  Feather,
  FontAwesome,
  FontAwesome5,
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from '@expo/vector-icons';
import React, {Component} from 'react';
import {
  ActivityIndicator,
  Animated,
  Easing,
  Image,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import GLOBALS from 'src/Globals';

export default class PrimaryButton extends Component {
  // Constructor
  constructor(props) {
    super(props);

    this.state = {
      bgColor: GLOBALS.COLORS.BLACK,
      fadeColor: GLOBALS.COLORS.DARKER_GRAY,

      fontColor: GLOBALS.COLORS.WHITE,
      toggleOverlay: false,
    };

    this.AnimatedColor = new Animated.Value(0);
  }

  // COMPONENT MOUNTED
  componentDidMount() {
    // Update Colors
    const {bgColor, fontColor} = this.props;
    this.updateColors(bgColor, fontColor);
  }

  // COMPONENT UPDATED
  componentDidUpdate(prevProps) {
    if (
      this.props.bgColor !== prevProps.bgColor ||
      this.props.fontColor !== prevProps.fontColor
    ) {
      const {bgColor, fontColor} = this.props;
      this.updateColors(bgColor, fontColor);
    }
  }

  // Update Color
  updateColors = (bgColor, fontColor) => {
    this.setState({
      bgColor: bgColor,
      fontColor: fontColor,
    });
  };

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
  };

  // Change Button Color with Animation
  fadeFromToWithTime = (oldBGColor, newBgColor, time) => {
    let animTime = 250;
    if (time) {
      animTime = time;
    }

    this.setState(
      {
        bgColor: oldBGColor,
        fadeColor: newBgColor,
      },
      () => {
        Animated.timing(this.AnimatedColor, {
          toValue: 100,
          Easing: Easing.easeInOut,
          duration: animTime,
          useNativeDriver: true,
        }).start(() => {
          this.setState(
            {
              bgColor: newBgColor,
              fadeColor: newBgColor,
            },
            () => {
              this.AnimatedColor = new Animated.Value(0);
            },
          );
        });
      },
    );
  };

  // Change State to refresh Color
  toggleOverlay = toggle => {
    this.setState({
      toggleOverlay: toggle,
    });
  };

  // Render Icon
  renderIcon = (iconFactory, icon, color, size, iconAlignToLeft, title) => {
    let Factory;

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
      case 'MaterialIcons':
        Factory = MaterialIcons;
        break;
      case 'MaterialCommunityIcons':
        Factory = MaterialCommunityIcons;
        break;
      case 'Feather':
        Factory = Feather;
        break;
      default:
        Factory = Ionicons;
    }

    if (iconFactory) {
      let iconStyle = null;

      if (iconFactory !== 'Image') {
        return (
          <View style={[styles.iconContainer, iconStyle]}>
            <Factory name={icon} color={color} size={size} />
          </View>
        );
      } else {
        return (
          <View style={[styles.iconContainer, iconStyle]}>
            <Image
              style={[{width: size, height: size}, styles.iconImage]}
              source={icon}
            />
          </View>
        );
      }
    } else {
      return null;
    }
  };

  // Set Render
  render() {
    const {
      style,
      setButtonStyle,
      setButtonInnerStyle,
      iconFactory,
      icon,
      iconSize,
      iconColor,
      iconAlignToLeft,
      title,
      fontSize,
      setHeight,
      loading,
      disabled,
      onPress,
      iconFirst,
      borderColor,
    } = this.props;

    // for updating style
    let updatedButtonStyle = {};

    let fontStyle = {
      color: this.state.fontColor,
      fontSize: fontSize,
      fontWeight: '500',
    };

    // For constructing color
    let interpolateColor = this.AnimatedColor.interpolate({
      inputRange: [0, 100],
      outputRange: [this.state.bgColor, this.state.fadeColor],
    });

    const animatedStyle = {
      backgroundColor: interpolateColor,
    };

    updatedButtonStyle.backgroundColor = this.state.bgColor;

    let containerItemsPlacementStyle = {};
    if (iconAlignToLeft) {
      containerItemsPlacementStyle.flexDirection = 'row-reverse';
    }

    let outerContainerStyle = {};
    if (setHeight) {
      updatedButtonStyle.height = setHeight;
    }

    return (
      <View style={[style, styles.outerContainer]}>
        <TouchableWithoutFeedback
          onPress={onPress}
          onPressIn={() => this.toggleOverlay(true)}
          onPressOut={() => this.toggleOverlay(false)}
          disabled={disabled || loading}>
          <Animated.View
            style={[
              styles.innerContainer,
              setButtonStyle,
              updatedButtonStyle,
              animatedStyle,
              borderColor ? {borderColor: borderColor, borderWidth: 2} : {},
            ]}>
            {this.state.toggleOverlay === false ? null : (
              <View style={styles.overlayContainer} />
            )}

            {loading === true ? (
              <ActivityIndicator
                style={styles.activity}
                size="small"
                color={iconColor ? iconColor : this.state.fontColor}
              />
            ) : (
              <View
                style={[
                  styles.container,
                  setButtonInnerStyle,
                  containerItemsPlacementStyle,
                ]}>
                {iconFirst &&
                  this.renderIcon(
                    iconFactory,
                    icon,
                    iconColor ? iconColor : this.state.fontColor,
                    iconSize,
                    iconAlignToLeft,
                    title,
                  )}
                {title && (
                  <Text style={[styles.title, fontStyle]}>{title}</Text>
                )}
                {!iconFirst &&
                  this.renderIcon(
                    iconFactory,
                    icon,
                    iconColor ? iconColor : this.state.fontColor,
                    iconSize,
                    iconAlignToLeft,
                    title,
                  )}
              </View>
            )}
          </Animated.View>
        </TouchableWithoutFeedback>
      </View>
    );
  }
}

// Styling
const styles = StyleSheet.create({
  outerContainer: {
    justifyContent: 'center',
    alignItems: 'stretch',
    alignSelf: 'stretch',
  },
  innerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
    borderRadius: 15,
    overflow: 'hidden',
  },
  overlayContainer: {
    position: 'absolute',
    ...StyleSheet.absoluteFill,
    backgroundColor: GLOBALS.COLORS.LIGHT_BLACK_TRANS,
  },
  container: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 12,
    color: GLOBALS.COLORS.WHITE,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
  },
  iconContainer: {
    marginHorizontal: 5,
  },
  iconImage: {
    resizeMode: 'contain',
    flex: 1,
  },
  iconAlignRight: {
    paddingLeft: 10,
  },
  iconAlignLeft: {
    paddingRight: 10,
  },
});
