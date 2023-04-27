import React from 'react';
import {Image, StyleSheet, View} from 'react-native';
import GLOBALS from 'src/Globals';

interface VideoPlaceholderProps {
  color?: string;
  uri: string;
}

const VideoPlaceholder = ({color, uri}: VideoPlaceholderProps) => {
  return (
    <View
      style={[
        styles.container,
        {backgroundColor: color || GLOBALS.COLORS.WHITE},
      ]}>
      <Image source={{uri}} style={styles.image} />
    </View>
  );
};

export default VideoPlaceholder;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 16,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
});
