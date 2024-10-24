import React, {useState} from 'react';
import {
  Image,
  ImageLoadEventData,
  NativeSyntheticEvent,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';

export const ImageMessage = ({
  imageSource,
  time,
  messageType,
}: {
  imageSource: string;
  time: string;
  messageType?: 'reply';
}) => {
  const [width, setWidth] = useState(1);

  const [aspectRatio, setAspectRatio] = useState(1);
  const MAX_WIDTH =
    messageType === 'reply' ? 100 : Platform.OS === 'android' ? 240 : 280;
  const MIN_WIDTH =
    messageType === 'reply' ? 60 : Platform.OS === 'android' ? 200 : 240;

  const getWidth = (_width: number) => {
    return Math.max(Math.min(_width, MAX_WIDTH), MIN_WIDTH);
  };

  const handleImageLoad = ({
    nativeEvent,
  }: NativeSyntheticEvent<ImageLoadEventData>) => {
    const {width: imgWidth, height: imgHeight} = nativeEvent.source;

    setWidth(imgWidth);
    setAspectRatio(imgWidth / imgHeight);
  };

  return (
    <View style={[styles.content, {width: getWidth(width), aspectRatio}]}>
      <Image
        source={{uri: imageSource}}
        onLoad={handleImageLoad}
        style={[styles.image, {width: getWidth(width), aspectRatio}]}
        resizeMode="contain"
      />
      {!messageType && <Text style={styles.time}>{time}</Text>}
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
    fontSize: 11,
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
