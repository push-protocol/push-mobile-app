import React, {Component} from 'react';
import {Image, StyleSheet, TouchableOpacity, View} from 'react-native';

export default ImageButton = ({style, src, iconSize, onPress}) => {
  // Rendor
  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity style={[styles.button]} onPress={onPress}>
        <Image
          style={[styles.image, {width: iconSize, height: iconSize}]}
          source={src}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
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
  image: {
    resizeMode: 'contain',
  },
});
