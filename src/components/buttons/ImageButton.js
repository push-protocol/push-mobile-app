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
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    alignSelf: 'center',
  },
  image: {
    flex: 1,
    resizeMode: 'contain',
  }
});
