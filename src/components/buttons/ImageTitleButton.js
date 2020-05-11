import React, { Component } from 'react';
import { View, TouchableHighlight, Text, Image, StyleSheet } from 'react-native';

import GLOBALS from 'src/Globals';

export default ImageTitleButton = ({ img, title, onPress }) => {
  // Rendor
  return (
      <TouchableHighlight
        style = {styles.container}
        onPress = {onPress}
        underlayColor = {GLOBALS.COLORS.DARK_GRAY}
      >
        <View style = {styles.childContainer}>
          <Image style = {styles.image} source = {img} />
          <Text style = {styles.title}>{title}</Text>
        </View>
      </TouchableHighlight>
  );
}

const styles = StyleSheet.create({
  container: {
  },
  childContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  image: {
    width: 60,
    height: 60,
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    color: GLOBALS.COLORS.WHITE
  }
});
