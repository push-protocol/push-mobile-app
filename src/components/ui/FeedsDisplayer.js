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
      forwardNid: -1,
      backwardPointer: 0,
      backwardNid: -1,
      visibleItemCount: 0,
      feedEnded: false,
      feedQueried: false,

      feedIsRefreshing: false,

      loadedImages: [],
      renderGallery: false,
      startFromIndex: 0,

      lastHiddenItemNid: -1,
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
      forwardNid: -1,
      backwardPointer: 0,
      backwardNid: -1,
      visibleItemCount: 0,
      feedEnded: false,
      feedQueried: false,

      feedIsRefreshing: false,
    }, () => {
      this.triggerGetItemsFromDB();
    })
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
      limit = diff;
    }

    const fetcheditems = await FeedDBHelper.getFeeds(this._db, fromPointer, limit, isHistorical);
    let storedFeed = this.state.items;

    let visibleItemCount = this.state.visibleItemCount;
    let totalCount = 0;
    let forwardNid = this.state.forwardNid;
    let backwardNid = this.state.backwardNid;

    const fNid = this.state.forwardNid;
    const bNid = this.state.backwardNid;
    const feedQueried = this.state.feedQueried;

    fetcheditems.forEach(function (item, index) {
      let itemValid = true;

      if (isHistorical) {
        if (bNid > item["nid"]) {
          storedFeed = [item, ...storedFeed];
        }
        else {
          itemValid = false;
        }
      }
      else {
        if (fNid < item["nid"] || fNid == -1) {
          storedFeed = feedQueried ? [item, ...storedFeed] : [...storedFeed, item];
        }
        else {
          itemValid = false;
        }
      }

      if (totalCount == 0 && itemValid) {
        forwardNid = item["nid"];
      }
      backwardNid = item["nid"];

      if (item["hidden"] != 1) {
        visibleItemCount = visibleItemCount + 1;
      }

      if (itemValid) {
        totalCount = totalCount + 1;
      }
    });

    const newForwardPointer = 0 // Since this is reverse, it will not affect the forward pointer
    //const newForwardPointer = !isHistorical ? this.state.forwardPointer + totalCount : this.state.forwardPointer;

    const newBackwardPointer = this.state.backwardPointer + totalCount;
    // console.log("ForwardPointer: " + newForwardPointer);
    // console.log("Forward NID: " + forwardNid);
    // console.log("BackwardPointer: " + newBackwardPointer);
    // console.log("Backward NID: " + backwardNid);
    // console.log("limit: " + limit);
    // console.log("is Historical: " + isHistorical);

    this.setState({
      items: storedFeed,
      visibleItemCount: visibleItemCount,
      feedIsRefreshing: false,
      feedQueried: true,
      feedEnded: fetcheditems ? false : true,

      forwardPointer: newForwardPointer,
      forwardNid: forwardNid,

      backwardPointer: newBackwardPointer,
      backwardNid: backwardNid,
    })

    // Feeds pulled after logic
    if (!isHistorical) {
      await MetaStorage.instance.setCurrentAndPreviousBadgeCount(0, 0);
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
    return;
    
    this.setState({
      visibleItemCount: this.state.visibleItemCount - 1,
      lastHiddenItemNid: nid,
      // items: this.state.items.filter(i => i["nid"] !== nid) // don't remove so it's better after unarchive
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
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  feedScrollContainer: {
    width: '100%',
    flex: 1,
    marginTop: 10,
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
