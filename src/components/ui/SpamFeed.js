import {Asset} from 'expo-asset';
import React, {useEffect, useRef, useState} from 'react';
import {
  FlatList,
  Image,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  View,
} from 'react-native';
import ImageView from 'react-native-image-viewing';
import {useSelector} from 'react-redux';
import StylishLabel from 'src/components/labels/StylishLabel';
import EPNSActivity from 'src/components/loaders/EPNSActivity';
import ImagePreviewFooter from 'src/components/ui/ImagePreviewFooter';
import FeedItemComponent from 'src/components/ui/testFeed/FeedItemComponents.js';
import ENV_CONFIG from 'src/env.config';
import {getCAIPAddress} from 'src/helpers/CAIPHelper';
import {selectCurrentUser, selectUsers} from 'src/redux/authSlice';

export default function SpamFeed(props) {
  const users = useSelector(selectUsers);
  const currentUser = useSelector(selectCurrentUser);
  const {wallet} = users[currentUser];

  const [initialized, setInitialized] = useState(false);
  const [feed, setFeed] = useState([]);
  const [page, setPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setloading] = useState(false);
  const [endReached, setEndReached] = useState(false);

  const [loadedImages, setLoadedImages] = useState([]);
  const [renderGallery, setRenderGallery] = useState(false);
  const [startFromIndex, setStartFromIndex] = useState(0);

  // SET REFS
  const FlatListFeedsRef = useRef(null);

  useEffect(() => {
    fetchInitializedFeeds();
  }, []);

  // Refresh Feed
  const fetchInitializedFeeds = async () => {
    setInitialized(true);
    setRefreshing(true);
    await performTimeConsumingTask();

    FlatListFeedsRef.current.scrollToOffset({animated: true, offset: 0});
    fetchFeed(true);
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

  const fetchFeed = async rewrite => {
    if (!endReached || rewrite === true) {
      if (!loading) {
        setloading(true);
        const apiURL = `${ENV_CONFIG.EPNS_SERVER}/v1/users/${getCAIPAddress(
          wallet,
        )}/feeds?page=${page}&limit=10&spam=true`;

        const resJson = await fetch(apiURL).then(response => response.json());

        if (resJson.itemcount !== 0 && resJson.feeds !== []) {
          // clear the notifs if present
          if (rewrite) {
            setFeed([...resJson.feeds]);
            setEndReached(false);
          } else {
            setFeed(prev => [...prev, ...resJson.feeds]);
          }
          setPage(prev => prev + 1);
          setEndReached(true);
        }
        setloading(false);
        setRefreshing(false);
      }
    }
  };

  return (
    <>
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
                privateKey={props.privateKey}
              />
            )}
            onEndReached={async () => (!endReached ? fetchFeed(false) : null)}
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
                    title="[dg:No Spams!]"
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
    </>
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
