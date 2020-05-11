import React, { Component } from 'react';
import {
  View,
  Switch,
  TouchableHighlight,
  Text,
  Image,
  Platform,
  StyleSheet
} from 'react-native';

import GLOBALS from 'src/Globals';

export default ImageTitleSwitchButton = ({
  img,
  title,
  onPress,
  isOn,
  onSwitchOnFunc,
  onSwitchOffFunc,
}) => {
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
          <Switch
            style = {styles.switch}
            ios_backgroundColor = {GLOBALS.COLORS.WHITE}
            trackColor = {{
              false: GLOBALS.COLORS.WHITE,
              true:  GLOBALS.COLORS.GRADIENT_PRIMARY
            }}
            thumbColor = {
              Platform.OS === 'ios' ? false : GLOBALS.COLORS.GRADIENT_PRIMARY
            }
            value = {isOn}
            onValueChange={v => {
              if (v) {
                if (onSwitchOnFunc) {
                  onSwitchOnFunc();
                }
              }
              else {
                if (onSwitchOffFunc) {
                  onSwitchOffFunc();
                }
              }
            }}
          />

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
    color: GLOBALS.COLORS.WHITE,
    flex: 1,
  },
  switch: {
    alignItems: 'flex-end',
    marginRight: 10,
    transform: [{ scaleX: .8 }, { scaleY: .8 }]
  },
});
