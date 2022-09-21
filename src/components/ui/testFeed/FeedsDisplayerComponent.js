import {Asset} from 'expo-asset';
import React from 'react';
import {
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import ImageView from 'react-native-image-viewing';
import SafeAreaView from 'react-native-safe-area-view';
import GLOBALS from 'src/Globals';
import {Toaster, ToasterOptions} from 'src/components/indicators/Toaster';
import StylishLabel from 'src/components/labels/StylishLabel';
import EPNSActivity from 'src/components/loaders/EPNSActivity';
import FeedItemWrapper from 'src/components/ui/FeedItemWrapper';
import ImagePreviewFooter from 'src/components/ui/ImagePreviewFooter';
import FeedDBHelper from 'src/helpers/FeedDBHelper';
import MetaStorage from 'src/singletons/MetaStorage';

const FeedsDisplayerComponent = props => {
  useEffect(() => {
    this.showToast(
      'Messages Unarchived! Restarting...',
      '',
      ToasterOptions.TYPE.GRADIENT_PRIMARY,
    );
  }, []);

  showToast = (msg, icon, type, tapCB, screenTime) => {
    refs.Toaster.showToast(msg, icon, type, tapCB, screenTime);
  };

  // To pull more feeds and store them in the feed items

  // // Show Toast
  // if (totalCount == 0) {
  //   // No New Items
  //   this.showToast("No New Notifications", "", ToasterOptions.TYPE.GRADIENT_PRIMARY);
  // }
  // else {
  //   this.showToast("New Notifications Loaded!", "", ToasterOptions.TYPE.GRADIENT_PRIMARY);

  // }

  // onEndReached = () => {
  //   console.log("Refreshing");

  //   if(!this.state.feedEnded){
  //     if (!this.state.feedIsRefreshing) {
  //       this.triggerGetItemsFromDB(true);
  //     }
  //   }

  //   // This is for flat list
  //   // onEndReached={this.onEndReached}
  //   // onEndReachedThreshold={0.5}
  // }

  // // To get ref for feed items
  // getRefForFeedItem = (nid) => {
  //   return 'feed' + nid;
  // }

  // For showing toast
  // const showToast = (msg, icon, type, tapCB, screenTime) => {
  // 	if (props.showToast) {
  // 		props.showToast(msg, icon, type, tapCB, screenTime);
  // 	}
  // };

  // Render Footer
  renderFooter = () => {
    return <EPNSActivity style={styles.activity} size="small" />;
  };

  // RENDER

  const {
    style,
    onFeedRefreshed,
    // showToast
    privateKey,
  } = this.props;

  render(
    <View style={styles.container}>
      <SafeAreaView style={styles.container}>
        <FlatList
          ref="feedScroll"
          style={styles.feedScrollContainer}
          refreshControl={
            <RefreshControl
              refreshing={this.state.feedIsRefreshing}
              onRefresh={() => {
                this.triggerGetItemsFromDB();
              }}
            />
          }
          data={feeds != [] ? feeds : []}
          // extraData={this.state}
          keyExtractor={item => item.payload_id}
          contentContainerStyle={styles.feedScrollContent}
          onEndReachedThreshold={100}
          renderItem={({item}) => (
            <FeedItemWrapper
              // ref={(ref) =>
              // 	(this.itemRefs = {
              // 		...this.itemRefs,
              // 		[this.getRefForFeedItem(item["nid"])]: ref,
              // 	})
              // }
              loading={props.loading}
              item={item}
              // nid={item["nid"]}
              // showToast={showToast}
              // itemArchived={(nid) => {
              // 	this.archiveItem(nid);
              // }}
              // onImagePreview={(fileURL) => this.showImagePreview(fileURL)}
              // privateKey={privateKey}
            />
          )}
          // ListEmptyComponent={
          // 	this.state.feedQueried == false ? (
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
        />
        <Toaster ref="Toaster" />
      </SafeAreaView>

      {/* <ImageView
				images={this.state.loadedImages}
				imageIndex={this.state.startFromIndex}
				visible={this.state.renderGallery}
				swipeToCloseEnabled={true}
				onRequestClose={() => {
					this.setState({
						renderGallery: false,
					});
				}}
				FooterComponent={({ imageIndex }) => (
					<ImagePreviewFooter
						imageIndex={imageIndex}
						imagesCount={this.state.loadedImages.length}
						fileURI={this.state.loadedImages[imageIndex].uri}
					/>
				)}
			/> */}
    </View>,
  );
};

export default FeedsDisplayerComponent;

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
  loading: {},
  noPendingFeeds: {},
  feed: {
    width: '100%',
  },
});
