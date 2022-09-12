import * as Sharing from 'expo-sharing';
import React from 'react';
import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import SafeAreaView from 'react-native-safe-area-view';

type Props = {
  imageIndex: number,
  imagesCount: number,
};

const ImagePreviewFooter = ({imageIndex, imagesCount, fileURI}: Props) => {
  const openSharing = async fileURI => {
    if (!(await Sharing.isAvailableAsync())) {
      // Do Nothing just return
      return;
    }

    Sharing.shareAsync(fileURI);
  };

  return (
    <SafeAreaView>
      <View style={styles.root}>
        <View style={styles.centerView}>
          <Text style={styles.text}>{`${
            imageIndex + 1
          } / ${imagesCount}`}</Text>
        </View>
        <View style={styles.rightView}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => openSharing(fileURI)}>
            <Text style={styles.buttontext}>Share</Text>
            <Image
              style={styles.image}
              source={require('assets/ui/share.png')}
            />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#00000077',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
  },
  centerView: {
    padding: 10,
  },
  rightView: {
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-end',
    padding: 10,
  },
  text: {
    fontSize: 14,
    color: '#FFF',
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  image: {
    width: 20,
    height: 20,
  },
  buttontext: {
    fontSize: 14,
    color: '#FFF',
    paddingHorizontal: 10,
  },
});

export default ImagePreviewFooter;
