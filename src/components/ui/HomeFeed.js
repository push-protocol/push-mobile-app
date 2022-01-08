import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  FlatList,
  Image,
  RefreshControl,
  Dimensions,
  ToastAndroid,
  ScrollView,
} from "react-native";
import Toast from "react-native-simple-toast";
import { Asset } from "expo-asset";
import ImageView from "react-native-image-viewing";
import ImagePreviewFooter from "src/components/ui/ImagePreviewFooter";
import FeedItemWrapper from "src/components/ui/testFeed/FeedItemWrapperComponent.js";
import FeedItemComponent from "src/components/ui/testFeed/FeedItemComponents.js";
import EPNSActivity from "src/components/loaders/EPNSActivity";
import StylishLabel from "src/components/labels/StylishLabel";
import { ToasterOptions, Toaster } from "src/components/indicators/Toaster";

import AppBadgeHelper from "src/helpers/AppBadgeHelper";

import ENV_CONFIG from "src/env.config";
import { ActivityIndicator } from "react-native";

export default function TestFeed(props) {
  // SET STATES
  const [initialized, setInitialized] = useState(false);
  const [feed, setFeed] = useState([]);
  const [page, setPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setloading] = useState(false);
  const [callOnScrollEnd, setCallOnScrollEnd] = useState(false);
  const [endReached, setEndReached] = useState(false);
  const [refresh, setRefresh] = useState(false);

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
  }, [initialized]);

  useEffect(() => {
    if (props.refreshNotifFeeds) {
      setInitialized(false);
    }
  }, [props.refreshNotifFeeds]);

  // Refresh Feed
  const fetchInitializedFeeds = async () => {
    setInitialized(true);
    setRefreshing(true);
    await performTimeConsumingTask();

    FlatListFeedsRef.current.scrollToOffset({ animated: true, offset: 0 });
    fetchFeed(true);
  };

  // Perform some task to wait
  const performTimeConsumingTask = async () => {
    return new Promise((resolve) =>
      setTimeout(() => {
        resolve("result");
      }, 500)
    );
  };

  const showImagePreview = async (fileURL) => {
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

  const fetchFeed = async (rewrite) => {
    if (!endReached || rewrite == true) {
      if (!loading) {
        //props.ToasterFunc("Fetching Notifs!", ToasterOptions.ICON_TYPE.PROCESSING, ToasterOptions.TYPE.GRADIENT_PRIMARY);

        // Check if this is a rewrite
        let paging = page;
        if (rewrite) {
          paging = 1;
        }

        setloading(true);
        const apiURL = ENV_CONFIG.EPNS_SERVER + ENV_CONFIG.ENDPOINT_GET_FEEDS;

        const wallet = props.wallet;
        await fetch(apiURL, {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user: wallet.toLowerCase(),
            page: paging,
            pageSize: 20,
            op: "read",
          }),
        })
          .then((response) => response.json())
          .then((resJson) => {
            if (resJson.count != 0 && resJson.results != []) {
              const data = feed;

              // clear the notifs if present
              AppBadgeHelper.setAppBadgeCount(0);

              // toast.current.show("New Notifications fetched");
              if (rewrite) {
                setFeed([...resJson.results]);
                setEndReached(false);
              } else {
                setFeed([...data, ...resJson.results]);
              }

              setPage(paging + 1);

              props.ToasterFunc(
                "New Notifications Loaded!",
                "",
                ToasterOptions.TYPE.GRADIENT_PRIMARY
              );
            } else {
              setEndReached(true);
              props.ToasterFunc(
                "No More Notifications",
                "",
                ToasterOptions.TYPE.ERROR
              );
            }
          })
          .catch((error) => {
            console.warn(error);
          });

        setloading(false);
        setRefreshing(false);
      }
    }
    // console.log(feed);
  };

  return (
    <>
      <SafeAreaView style={styles.container}>
        {/* {feed != [] && ( */}
        <View style={{ flex: 1 }}>
          <FlatList
            ref={FlatListFeedsRef}
            data={feed}
            keyExtractor={(item) => item.payload_id.toString()}
            // onEndReached={() => {
            // 	console.log("END REACHED");
            // 	setloading(true);
            // }}
            initialNumToRender={10}
            style={{ flex: 1 }}
            showsVerticalScrollIndicator={false}
            // contentContainerStyle={{ marginBottom: 100 }}
            // onEndReachedThreshold={0.}
            // onMomentumScrollBegin={}
            // initialNumToRender={5}
            renderItem={({ item }) => (
              <FeedItemComponent
                loading={loading}
                // ref={(ref) =>
                // 	(this.itemRefs = {
                // 		...this.itemRefs,
                // 		[this.getRefForFeedItem(item["nid"])]: ref,
                // 	})
                // }
                item={item}
                onImagePreview={(fileURL) => showImagePreview(fileURL)}
                // nid={item["nid"]}
                // itemArchived={(nid) => {
                // 	this.archiveItem(nid);
                // }}
                // onImagePreview={(fileURL) => this.showImagePreview(fileURL)}
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
                    source={require("assets/ui/feed.png")}
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
                <View style={{ paddingBottom: 30, marginTop: 20 }}>
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
            FooterComponent={({ imageIndex }) => (
              <ImagePreviewFooter
                imageIndex={imageIndex}
                imagesCount={loadedImages.length}
                fileURI={loadedImages[imageIndex].uri}
              />
            )}
          />

          {/* {loading && (
						<View>
							<ActivityIndicator size="large" color="#0000000" />
						</View>
					)} */}
        </View>
        {/* )} */}
        {/* <FlatList
				// ref="feedScroll"
				style={styles.feedScrollContainer}
				// refreshControl={
				// 	<RefreshControl
				// 		refreshing={this.state.feedIsRefreshing}
				// 		onRefresh={() => {
				// 			this.triggerGetItemsFromDB();
				// 		}}
				// 	/>
				// }
				data={feed!=[]? feed : []}
				// extraData={this.state}
				keyExtractor={(item) => item.payload_id}
				contentContainerStyle={styles.feedScrollContent}
				renderItem={({ item }) => (
					<View key={item.payload_id}>
					<TouchableOpacity>
						<Text>hi</Text>
					</TouchableOpacity>
					</View>
				)}
				// ListEmptyComponent={
				// 	feed == [] ? (
				// 		<View style={[styles.infodisplay, styles.loading]}>
				// 			<EPNSActivity style={styles.activity} size="small" />
				// 		</View>
				// 	) : (
				// 		<View style={[styles.infodisplay, styles.noPendingFeeds]}>
				// 			<Image
				// 				style={styles.infoIcon}
				// 				source={require("assets/ui/feed.png")}
				// 			/>
				// 			<StylishLabel
				// 				style={styles.infoText}
				// 				fontSize={16}
				// 				title="[dg:No New Notification!]"
				// 			/>
				// 		</View>
				// 	)
				// }
			/> */}
      </SafeAreaView>
      {/* <Toast ref={toast} duration={500} /> */}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
  },
  infodisplay: {
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  infoIcon: {
    height: 48,
    resizeMode: "contain",
    margin: 10,
  },
  infoText: {
    marginVertical: 10,
  },
});