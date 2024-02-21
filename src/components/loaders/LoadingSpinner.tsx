import React, {useEffect, useRef} from 'react';
import {
  Animated,
  Easing,
  Image,
  ImageStyle,
  StyleProp,
  StyleSheet,
} from 'react-native';

interface LoadingSpinnerProps {
  style?: StyleProp<ImageStyle>;
}

const LoadingSpinner = ({style}: LoadingSpinnerProps) => {
  const rotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const rotateSpinner = () => {
      Animated.loop(
        Animated.timing(rotation, {
          toValue: 1,
          duration: 2000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ).start();
    };

    rotateSpinner();

    return () => rotation.setValue(0); // Reset the animation value when unmounting
  }, []);

  const spin = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.Image
      source={require('assets/ui/spinner.png')}
      style={[styles.spinner, {transform: [{rotate: spin}]}, style]}
    />
  );
};

export default LoadingSpinner;

const styles = StyleSheet.create({
  spinner: {
    width: 42,
    height: 42,
  },
});
