import React, { Component } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import SafeAreaView from 'react-native-safe-area-view';

//import FeedItemWrapper from 'FeedItemWrapper';

import FeedDBHelper from 'src/helpers/FeedDBHelper';
import MetaStorage from 'src/singletons/MetaStorage';

import GLOBALS from 'src/Globals';

export default class FeedsDisplayer extends Component {
  // CONSTRUCTOR
  constructor(props) {
    super(props);

    this.state = {
      feedItems: [],
      feedPointer: 0,
      feedEnded: false,

      enabled: false,
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
  // trigger getting feed items
  triggerGetFeedItemsDromDB = async (isHistorical) => {
    this.setState({
      feedEnded: false
    })

    const result = await this.getFeedItemsFromDB();
    return result;
  }

  // To pull more feeds and store them in the feed items
  getFeedItemsFromDB = async (isHistorical) => {
    this.setState({
      enabled: true,
    });

    const fromPointer = this.state.feedPointer;
    let limit = GLOBALS.CONSTANTS.FEED_ITEMS_TO_PULL;

    const newBadge = await MetaStorage.instance.getBadgeCount();
    const prevBadge = await MetaStorage.instance.getPreviousBadgeCount();
    const diff = newBadge - prevBadge;

    if (diff > limit) {
      diff = limit;
    }

    const fetchedFeedItems = await FeedDBHelper.getFeeds(this._db, fromPointer, limit, isHistorical);
    const storedFeed = this.state.feedItems;

    fetchedFeedItems.forEach(function (item, index) {
      [...storedFeed, item];
      console.log(item);
    });

    this.setState({
      feedItems: storedFeed,
      enabled: false,
    })

    if (!fetchedFeedItems) {
      result = false;
    }
    else {
      result = fetchedFeedItems.length;
    }

    if (result == false) {
      this.setState({
        feedEnded: true
      })
    }

    return result;
  }

  // RENDER
  render() {
    const {
      style,
    } = this.props;

    return (
      <SafeAreaView style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollView}
          refreshControl={
            <RefreshControl
              refreshing={true}
              onRefresh={() => {
                this.getFeedItemsFromDB();
              }}
              enabled={this.state.enabled}
            />
          }
        >

        </ScrollView>
      </SafeAreaView>
    );
  }
}

// Styling
const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
});
