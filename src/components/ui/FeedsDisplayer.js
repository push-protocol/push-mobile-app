import React, { Component } from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import SafeAreaView from 'react-native-safe-area-view';
import { Asset } from 'expo-asset';

import ImageView from "react-native-image-viewing";
import ImagePreviewFooter from 'src/components/ui/ImagePreviewFooter';

import FeedItemWrapper from 'src/components/ui/FeedItemWrapper';
import EPNSActivity from 'src/components/loaders/EPNSActivity';
import { ToasterOptions } from 'src/components/indicators/Toaster';

import StylishLabel from 'src/components/labels/StylishLabel';
import FeedDBHelper from 'src/helpers/FeedDBHelper';
import MetaStorage from 'src/singletons/MetaStorage';

import GLOBALS from 'src/Globals';

export default class FeedsDisplayer extends Component {
  // CONSTRUCTOR
  constructor(props) {
    super(props);

    this.state = {
      items: [],
      forwardPointer: 0,
      backwardPointer: 0,
      visibleItemCount: 0,
      feedEnded: false,
      feedQueried: false,

      feedIsRefreshing: false,

      loadedImages: [],
      renderGallery: false,
      startFromIndex: 0,
    }

    this._db = null;
  }

  // COMPONENT MOUNTED
  async componentDidMount() {
    // Connect to Feed DB Helper
    this._db = FeedDBHelper.getDB();
  }

  async omponentWillUnmount() {
    this._db = null;
  }

  // FUNCTIONS
  // to reset the feed and refresh
  resetFeedState = () => {
    this.setState({
      items: [],
      forwardPointer: 0,
      backwardPointer: 0,
      visibleItemCount: 0,
      feedEnded: false,
      feedQueried: false,

      feedIsRefreshing: false,
    }, () => {
      this.triggerGetItemsFromDB();
    })
  }

  resetForwardPointer = (newPointerIndex) => {
    this.setState({
      forwardPointer: newPointerIndex,
    })

    this.triggerGetItemsFromDB();
  }

  resetBackwardPointer = (newPointerIndex) => {
    this.setState({
      backwardPointer: newPointerIndex,
    })

    this.triggerGetItemsFromDB(true);
  }

  // trigger getting feed items
  triggerGetItemsFromDB = async (isHistorical) => {
    const result = await this.getItemsFromDB(isHistorical);
    return result;
  }

  // To pull more feeds and store them in the feed items
  getItemsFromDB = async (isHistorical) => {
    this.setState({
      feedIsRefreshing: true,
    });

    // Wait for some time
    await this.performTimeConsumingTask();

    const fromPointer = !isHistorical ? this.state.forwardPointer : this.state.backwardPointer;
    let limit = GLOBALS.CONSTANTS.FEED_ITEMS_TO_PULL;

    // console.log("getting Items: " + fromPointer + "| Limit: " + limit);

    const newBadge = await MetaStorage.instance.getBadgeCount();
    const prevBadge = await MetaStorage.instance.getPreviousBadgeCount();
    const diff = newBadge - prevBadge;

    if (diff > limit) {
      diff = limit;
    }

    const fetcheditems = await FeedDBHelper.getFeeds(this._db, fromPointer, limit, isHistorical);
    let storedFeed = this.state.items;

    let visibleItemCount = this.state.visibleItemCount;
    let totalCount = 0;

    fetcheditems.forEach(function (item, index) {
      if (item["hidden"] != 1) {
        storedFeed = [...storedFeed, item];
        visibleItemCount = visibleItemCount + 1;
      }

      totalCount = totalCount + 1;
    });

    const newForwardPointer = !isHistorical ? this.state.forwardPointer + totalCount : this.state.forwardPointer;
    const newBackwardPointer = isHistorical ? this.state.backwardPointer + totalCount : this.state.backwardPointer;

    this.setState({
      items: storedFeed,
      visibleItemCount: visibleItemCount,
      feedIsRefreshing: false,
      feedQueried: true,
      feedEnded: fetcheditems ? false : true,

      forwardPointer: newForwardPointer,
      backwardPointer: newBackwardPointer,
    })

    // Feeds pulled after logic
    if (!isHistorical) {
      await MetaStorage.instance.setCurrentAndPreviousBadgeCount(0, 0);

      // Adjust iOS Badge as well
      if (Platform.OS ===  "ios") {

      }
    }

    // Show Toast
    if (totalCount == 0) {
      // No New Items
      this.showToast("No New Notifications", "", ToasterOptions.TYPE.GRADIENT_PRIMARY);
    }
    else {
      this.showToast("New Notifications Loaded!", "", ToasterOptions.TYPE.GRADIENT_PRIMARY);
    }

    // Do Feed Refresh callback if it exists
    if (this.props.onFeedRefreshed) {
      this.props.onFeedRefreshed();
    }

    return true;
  }

  // Perform some task to wait
  performTimeConsumingTask = async () => {
    return new Promise((resolve) =>
      setTimeout(
        () => { resolve('result') },
        500
      )
    );
  }

  // Archive an item
  archiveItem = (nid) => {
    this.setState({
      visibleItemCount: this.state.visibleItemCount - 1,
      items: this.state.items.filter(i => i["nid"] !== nid)
    });

  }

  // For showing toast
  showToast = (msg, icon, type) => {
    if (this.props.showToast) {
      this.props.showToast(msg, icon, type);
    }
  }

  // Show Image Preview
  showImagePreview = async (fileURL) => {
    let validPaths = [];
    let fileIndex = -1;

    // Add Image
    // Download the file if not done already
    await Asset.loadAsync(fileURL);

    // Push to valid path
    validPaths.push({
      uri: Asset.fromModule(fileURL).uri,
      id: fileURL
    });

    fileIndex = validPaths.length - 1;

    // console.log("LOADED IMAGES:");
    // console.log(validPaths);

    this.setState({
      loadedImages: validPaths,
      renderGallery: true,
      startFromIndex: fileIndex
    })
  }

  // RENDER
  render() {
    const {
      style,
      onFeedRefreshed,
      showToast,
      privateKey,
    } = this.props;

    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.container}>
          <FlatList
            style={styles.feedScrollContainer}
            refreshControl={
              <RefreshControl
                refreshing={this.state.feedIsRefreshing}
                onRefresh={() => {
                  this.getItemsFromDB();
                }}
              />
            }
            data={this.state.items}
            keyExtractor={item => item["nid"].toString()}
            contentContainerStyle={styles.feedScrollContent}
            renderItem={({ item }) => (
              <FeedItemWrapper
                item={item}
                nid={item["nid"]}
                showToast={showToast}
                itemArchived={(nid) => {
                  this.archiveItem(nid);
                }}
                onImagePreview={(fileURL) => (this.showImagePreview(fileURL))}
                privateKey={privateKey}
              />
            )}
            ListEmptyComponent={
              this.state.feedQueried == false
                ? <View
                    style={[ styles.infodisplay, styles.loading ]}
                  >
                    <EPNSActivity
                      style={styles.activity}
                      size="small"
                    />
                  </View>
                : <View
                    style={[ styles.infodisplay, styles.noPendingFeeds ]}
                  >
                    <Image
                      style={styles.infoIcon}
                      source={require('assets/ui/feed.png')}
                    />
                    <StylishLabel
                      style={styles.infoText}
                      fontSize={16}
                      title='[darkgray:No New Notification!]'
                    />
                  </View>
            }
          />

        </SafeAreaView>

        <ImageView
          images = {this.state.loadedImages}
          imageIndex = {this.state.startFromIndex}
          visible = {this.state.renderGallery}
          swipeToCloseEnabled = {true}
          onRequestClose = {() => {
            this.setState({
              renderGallery: false,
            })
          }}
          FooterComponent={({ imageIndex }) => (
            <ImagePreviewFooter
              imageIndex = {imageIndex}
              imagesCount = {this.state.loadedImages.length}
              fileURI = {this.state.loadedImages[imageIndex].uri}
            />
          )}
        />
      </View>
    );
  }
}

// Styling
const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 15,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  feedScrollContainer: {
    width: '100%',
    flex: 1,
  },
  feedScrollContent: {
    flexGrow: 1,
  },
  infodisplay: {
    flexGrow: 1,
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
  loading: {

  },
  noPendingFeeds: {

  },
  feed: {
    width: '100%',
  }
});
