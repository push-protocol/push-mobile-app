import React from 'react';
import {Image, StyleSheet, Text, View} from 'react-native';

export const ImageMessage = ({
  imageSource,
  time,
}: {
  imageSource: string;
  time: string;
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.imageContainer}>
          <Image
            source={{
              uri: imageSource,
            }}
            style={styles.image}
            resizeMode="stretch"
          />
        </View>
        <Text style={styles.time}>{time}</Text>
      </View>
    </View>
  );
};

export default ImageMessage;

const styles = StyleSheet.create({
  container: {
    minWidth: '90%',
    maxWidth: '90%',
  },
  imageContainer: {
    overflow: 'hidden',
    borderRadius: 8,
  },
  image: {
    width: '100%',
    aspectRatio: 16 / 9,
  },
  content: {
    padding: 10,
  },
  time: {
    fontSize: 13,
    textAlign: 'right',
    position: 'absolute',
    right: 16,
    bottom: 16,
    backgroundColor: 'rgba(60, 60, 60, 0.65)',
    borderRadius: 8,
    paddingVertical: 1,
    paddingHorizontal: 10,
    color: 'rgba(256,256,256,0.8)',
  },
});
