import React, {useEffect, useState, useRef} from 'react';
import {
  View,
  SafeAreaView,
  StyleSheet,
  FlatList,
  Image,
  RefreshControl,
} from 'react-native';

import {Asset} from 'expo-asset';
import ImageView from 'react-native-image-viewing';
import ImagePreviewFooter from 'src/components/ui/ImagePreviewFooter';

import FeedItemComponent from 'src/components/ui/testFeed/FeedItemComponents.js';
import EPNSActivity from 'src/components/loaders/EPNSActivity';
import StylishLabel from 'src/components/labels/StylishLabel';

import {useSelector, useDispatch} from 'react-redux';
import {selectUsers, selectCurrentUser} from 'src/redux/authSlice';
import {
  selectFeedState,
  setRefreshing,
  fetchFeedData,
} from 'src/redux/feedSlice';

export default function TestFeed(props) {
  const dispatch = useDispatch();
  const users = useSelector(selectUsers);
  const currentUser = useSelector(selectCurrentUser);
  const {feed, refreshing, loading, endReached, page} =
    useSelector(selectFeedState);

  console.log('Feed State: ', useSelector(selectFeedState));

  const {userPKey, wallet} = users[currentUser];

  // SET STATES
  const [initialized, setInitialized] = useState(false);

  const [loadedImages, setLoadedImages] = useState([]);
  const [renderGallery, setRenderGallery] = useState(false);
  const [startFromIndex, setStartFromIndex] = useState(0);

  // SET REFS
  const FlatListFeedsRef = useRef(null);

  // LOGIC
  useEffect(() => {
    if (!initialized) {
      fetchInitializedFeeds();
    }
  }, [initialized, currentUser]);

  useEffect(() => {
    if (props.refreshNotifFeeds) {
      setInitialized(false);
    }
  }, [props.refreshNotifFeeds]);

  // Refresh Feed
  const fetchInitializedFeeds = async () => {
    setInitialized(true);
    dispatch(setRefreshing(true));
    await performTimeConsumingTask();

    FlatListFeedsRef.current.scrollToOffset({animated: true, offset: 0});
    dispatch(
      fetchFeedData({
        rewrite: true,
        page,
        loading,
        endReached,
        wallet,
        ToasterFunc: props.ToasterFunc,
      }),
    );
  };

  // Perform some task to wait
  const performTimeConsumingTask = async () => {
    return new Promise(resolve =>
      setTimeout(() => {
        resolve('result');
      }, 500),
    );
  };

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

    setLoadedImages(validPaths);
    setRenderGallery(true);
    setStartFromIndex(fileIndex);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={{flex: 1}}>
        <FlatList
          ref={FlatListFeedsRef}
          data={feed}
          keyExtractor={item => item.payload_id.toString()}
          initialNumToRender={10}
          style={{flex: 1}}
          showsVerticalScrollIndicator={false}
          renderItem={({item}) => (
            <FeedItemComponent
              loading={loading}
              item={item}
              onImagePreview={fileURL => showImagePreview(fileURL)}
              privateKey={userPKey}
            />
          )}
          onEndReached={async () =>
            !endReached
              ? dispatch(
                  fetchFeedData({
                    rewrite: false,
                    page,
                    loading,
                    endReached,
                    wallet,
                    ToasterFunc: props.ToasterFunc,
                  }),
                )
              : null
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setInitialized(false);
              }}
            />
          }
          ListEmptyComponent={
            refreshing ? (
              <View style={[styles.infodisplay, styles.noPendingFeeds]}>
                <StylishLabel
                  style={styles.infoText}
                  fontSize={16}
                  title="[dg:Please wait, Refreshing feed.!]"
                />
              </View>
            ) : (
              <View style={[styles.infodisplay, styles.noPendingFeeds]}>
                <Image
                  style={styles.infoIcon}
                  source={require('assets/ui/feed.png')}
                />
                <StylishLabel
                  style={styles.infoText}
                  fontSize={16}
                  title="[dg:No Notifications!]"
                />
              </View>
            )
          }
          ListFooterComponent={() => {
            return loading ? (
              <View style={{paddingBottom: 30, marginTop: 20}}>
                <EPNSActivity style={styles.activity} size="small" />
              </View>
            ) : null;
          }}
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
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
  infodisplay: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  infoIcon: {
    height: 48,
    resizeMode: 'contain',
    margin: 10,
  },
  infoText: {
    marginVertical: 10,
  },
});
