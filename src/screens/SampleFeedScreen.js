
import SpamFeed from "../components/ui/SpamFeed";

import React from 'react';
import {
  StatusBar,
  View,
  Text,
  Image,
  StyleSheet,
  Button,
  TouchableOpacity,
  FlatList
} from 'react-native';
import SafeAreaView from 'react-native-safe-area-view';

import FeedItemComponent from "src/components/ui/testFeed/FeedItemComponents.js";
import EPNSActivity from "src/components/loaders/EPNSActivity";
import StylishLabel from "src/components/labels/StylishLabel";

import sampleFeed from 'src/jsons/SampleFeed'
import GLOBALS from 'src/Globals';

const SampleFeedScreen = ({ style }) => {
  return (
    <SafeAreaView style={[ styles.container, style ]}>
      <StatusBar
        barStyle={'dark-content'}
        translucent
        backgroundColor="transparent"
      />

      <FlatList
        data={sampleFeed}
        keyExtractor={(item) => item.payload_id.toString()}
        // onEndReached={() => {
        // 	console.log("END REACHED");
        // 	setloading(true);
        // }}
        initialNumToRender={10}
        style={{ flex: 1 }}
        // contentContainerStyle={{ marginBottom: 100 }}
        // onEndReachedThreshold={0.}
        // onMomentumScrollBegin={}
        // initialNumToRender={5}
        renderItem={({ item }) => (
          <FeedItemComponent
            loading={false}
            // ref={(ref) =>
            // 	(this.itemRefs = {
            // 		...this.itemRefs,
            // 		[this.getRefForFeedItem(item["nid"])]: ref,
            // 	})
            // }
            item={item}
            // nid={item["nid"]}
            // itemArchived={(nid) => {
            // 	this.archiveItem(nid);
            // }}
            // onImagePreview={(fileURL) => this.showImagePreview(fileURL)}
            // privateKey={privateKey}
          />
        )}
        // onEndReached={async () => (!endReached ? await fetchFeed() : null)}
        // refreshControl={
        // 	<RefreshControl
        // 		refreshing={refreshing}
        // 		onRefresh={() => {
        // 			if (!endReached) {
        // 				setRefreshing(true);
        // 				fetchFeed();
        // 			}
        // 			// this.triggerGetItemsFromDB();
        // 			// setTimeout(() => {
        // 			// 	setRefreshing(false);
        // 			// }, 3000);
        // 		}}
        // 	/>
        // }
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
        // ListFooterComponent={() => {
        // 	return loading ? (
        // 		<View style={{ paddingBottom: 20 }}>
        // 			<ActivityIndicator size="large" color="#000000" />
        // 		</View>
        // 	) : null;
        // }}
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
    fontSize: 45
  },
  subHeaderStyle: {
    fontSize: 20
  }
});

export default SampleFeedScreen;
