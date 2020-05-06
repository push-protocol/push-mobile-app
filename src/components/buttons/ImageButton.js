import React, { Component } from 'react';
import { View, TouchableOpacity, Image, StyleSheet } from 'react-native';

export default ImageButton = ({ style, src, onPress }) => {
  // Rendor
  return (
    <View style={[ styles.container, style ]}>
      <TouchableOpacity
        style={[ styles.button ]}
        onPress={onPress}
      >
        <Image style={styles.image} source={src} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  button: {
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
  },
  inner: {
    flex: 1,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    flex: 1,
    resizeMode: 'contain',
  }
});
