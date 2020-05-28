import React, { Component } from 'react';
import { View, TouchableHighlight, Text, Image, StyleSheet } from 'react-native';

import GLOBALS from 'src/Globals';

export default ImageTitleButton = ({ img, title, onPress }) => {
  // Rendor
  return (
      <TouchableHighlight
        style = {styles.container}
        onPress = {onPress}
        underlayColor = {GLOBALS.COLORS.SLIGHT_GRAY}
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
    width: '100%',
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderColor: GLOBALS.COLORS.LIGHT_GRAY,
  },
  childContainer: {
    flexDirection: 'row',
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginVertical: 10,
    marginHorizontal: 15,
  },
  image: {
    width: 24,
    height: 24,
    marginRight: 5,
    resizeMode: 'contain',
  },
  title: {
    margin: 10,
    fontSize: 14,
    fontWeight: '400',
    fontWeight: '200',
  }
});
