import React, {useState} from 'react';
import {StatusBar, StyleSheet, FlatList} from 'react-native';
import SafeAreaView from 'react-native-safe-area-view';
import {Asset} from 'expo-asset';
import ImageView from 'react-native-image-viewing';
import ImagePreviewFooter from 'src/components/ui/ImagePreviewFooter';
import FeedItemComponent from 'src/components/ui/testFeed/FeedItemComponents.js';

import sampleFeed from 'src/jsons/SampleFeed';
import GLOBALS from 'src/Globals';

const SampleFeedScreen = ({style}) => {
  const showImagePreview = async fileURL => {
    let validPaths = [];
    let fileIndex = -1;

    // Add Image
    // Download the file if not done already
    await Asset.loadAsync(fileURL);

    // Push to valid path
    validPaths.push({
      uri: Asset.fromModule(fileURL).uri,
      id: fileURL,
    });

    fileIndex = validPaths.length - 1;

    // console.log("LOADED IMAGES:");
    // console.log(validPaths);

    setLoadedImages(validPaths);
    setRenderGallery(true);
    setStartFromIndex(fileIndex);
  };

  const [loadedImages, setLoadedImages] = useState([]);
  const [renderGallery, setRenderGallery] = useState(false);
  const [startFromIndex, setStartFromIndex] = useState(0);
  return (
    <SafeAreaView style={[styles.container, style]}>
      <StatusBar
        barStyle={'dark-content'}
        translucent
        backgroundColor="transparent"
      />

      <FlatList
        data={sampleFeed}
        keyExtractor={item => item.payload_id.toString()}
        initialNumToRender={10}
        style={{flex: 1}}
        renderItem={({item}) => (
          <FeedItemComponent
            loading={false}
            item={item}
            onImagePreview={fileURL => showImagePreview(fileURL)}
          />
        )}
      />

      <ImageView
        images={loadedImages}
        imageIndex={startFromIndex}
        visible={renderGallery}
        swipeToCloseEnabled={true}
        onRequestClose={() => {
          setRenderGallery(false);
        }}
        FooterComponent={({imageIndex}) => (
          <ImagePreviewFooter
            imageIndex={imageIndex}
            imagesCount={loadedImages.length}
            fileURI={loadedImages[imageIndex].uri}
          />
        )}
      />
    </SafeAreaView>
  );
};

// Styling
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: GLOBALS.COLORS.WHITE,
  },
  textStyle: {
    fontSize: 45,
  },
  subHeaderStyle: {
    fontSize: 20,
  },
});

export default SampleFeedScreen;
