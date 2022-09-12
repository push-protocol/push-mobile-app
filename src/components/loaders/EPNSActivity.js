import MaskedView from '@react-native-community/masked-view';
import {LinearGradient} from 'expo-linear-gradient';
import React from 'react';
import {ActivityIndicator, Platform, StyleSheet, View} from 'react-native';
import GLOBALS from 'src/Globals';

const EPNSActivity = ({style, size, color}) => {
  return (
    <View
      style={[
        styles.container,
        style,
        size === 'small' ? styles.small : styles.big,
      ]}>
      {Platform.OS == 'android' || color ? (
        <ActivityIndicator
          style={styles.activity}
          size={size}
          color={color ? color : GLOBALS.COLORS.GRADIENT_THIRD}
        />
      ) : (
        <MaskedView
          style={styles.maskedView}
          maskElement={
            <View style={styles.maskedElementView}>
              <ActivityIndicator
                style={styles.activity}
                size={size}
                color={GLOBALS.COLORS.BLACK}
              />
            </View>
          }>
          <ActivityIndicator
            style={styles.activity}
            size={size}
            color={GLOBALS.COLORS.WHITE}
          />
          <LinearGradient
            colors={[
              GLOBALS.COLORS.GRADIENT_PRIMARY,
              GLOBALS.COLORS.GRADIENT_SECONDARY,
              GLOBALS.COLORS.GRADIENT_THIRD,
            ]}
            style={[
              styles.fullgradient,
              size === 'small' ? styles.small : styles.big,
            ]}
            start={[0.1, 0.3]}
            end={[1, 1]}></LinearGradient>
        </MaskedView>
      )}
    </View>
  );
};

// Styling
const styles = StyleSheet.create({
  container: {
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  small: {
    width: 40,
    height: 20,
  },
  big: {
    height: 36,
    width: 36,
  },
  maskedView: {
    flex: 1,
    flexDirection: 'row',
    height: '100%',
  },
  maskedElementView: {
    backgroundColor: 'transparent',
    flex: 1,
    alignItems: 'center',
  },
  maskedTitle: {
    color: 'black',
    fontWeight: 'bold',
  },
  fullgradient: {
    alignItems: 'flex-end',
    width: '100%',
  },
});

export default EPNSActivity;
