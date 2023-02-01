import React, {useEffect, useState} from 'react';
import {Image, Platform, StyleSheet, Text, View} from 'react-native';

export const ImageMessage = ({
  imageSource,
  time,
}: {
  imageSource: string;
  time: string;
}) => {
  const [width, setWidth] = useState(1);

  const [aspectRatio, setAspectRatio] = useState(1);
  const [ready, setIsReady] = useState(false);
  const MAX_WIDTH = Platform.OS === 'android' ? 240 : 280;

  const getWidth = (_width: number) => {
    return Math.min(_width, MAX_WIDTH);
  };

  useEffect(() => {
    try {
      Image.getSize(imageSource, (_width, _height) => {
        setWidth(_width);
        setAspectRatio(_width / _height);
        setIsReady(true);
      });
    } catch (error) {}
  }, [imageSource]);

  if (!ready) {
    return <View />;
  }

  return (
    <View style={[styles.content, {width: getWidth(width), aspectRatio}]}>
      <Image
        source={{
          uri: imageSource,
        }}
        style={[styles.image, {width: getWidth(width), aspectRatio}]}
        resizeMode="contain"
      />
      <Text style={styles.time}>{time}</Text>
    </View>
  );
};

export default ImageMessage;

const styles = StyleSheet.create({
  image: {
    overflow: 'hidden',
  },
  content: {
    borderRadius: 10,
    overflow: 'hidden',
    width: '100%',
  },
  time: {
    fontSize: 13,
    textAlign: 'right',
    position: 'absolute',
    right: 8,
    bottom: 8,
    backgroundColor: 'rgba(60, 60, 60, 0.65)',
    borderRadius: 12,
    paddingVertical: 1,
    paddingHorizontal: 10,
    color: 'rgba(256,256,256,0.8)',
  },
});
