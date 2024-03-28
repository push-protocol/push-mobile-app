import * as React from 'react';
import {Animated, Easing, Pressable, StyleSheet} from 'react-native';
import GLOBALS from 'src/Globals';

interface ToggleButtonProps {
  onToggle: () => void;
  isOn: boolean;
}

const ToggleButton = ({isOn, onToggle}: ToggleButtonProps) => {
  const animatedValue = React.useRef(new Animated.Value(isOn ? 1 : 0)).current;

  const moveToggle = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [6, 20],
  });

  const backgroundColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['#E0E3E7', GLOBALS.COLORS.PINK],
  });

  const handleToggle = () => {
    Animated.timing(animatedValue, {
      toValue: isOn ? 0 : 1,
      duration: 100,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start();
    onToggle();
  };

  return (
    <Pressable onPress={handleToggle}>
      <Animated.View style={[styles.toggleContainer, {backgroundColor}]}>
        <Animated.View
          style={[styles.toggleWheelStyle, {marginLeft: moveToggle}]}
        />
      </Animated.View>
    </Pressable>
  );
};

export default ToggleButton;

const styles = StyleSheet.create({
  toggleContainer: {
    width: 42,
    height: 24,
    marginLeft: 3,
    borderRadius: 24,
    justifyContent: 'center',
    backgroundColor: GLOBALS.COLORS.PINK,
  },
  toggleWheelStyle: {
    width: 14,
    height: 14,
    backgroundColor: 'white',
    borderRadius: 7,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2.5,
    elevation: 1.5,
  },
});
