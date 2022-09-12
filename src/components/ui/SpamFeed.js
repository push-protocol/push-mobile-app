import React, {useEffect, useRef, useState} from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  ToastAndroid,
  TouchableOpacity,
  View,
} from 'react-native';
import {ActivityIndicator} from 'react-native';
import Toast from 'react-native-simple-toast';
import {useSelector} from 'react-redux';
import StylishLabel from 'src/components/labels/StylishLabel';
import EPNSActivity from 'src/components/loaders/EPNSActivity';
import FeedItemComponent from 'src/components/ui/testFeed/FeedItemComponents.js';
import FeedItemWrapper from 'src/components/ui/testFeed/FeedItemWrapperComponent.js';
import ENV_CONFIG from 'src/env.config';
import {selectCurrentUser, selectUsers} from 'src/redux/authSlice';

export default function SpamFeed(props) {
  const users = useSelector(selectUsers);
  const currentUser = useSelector(selectCurrentUser);

  const {wallet} = users[currentUser];

  // const toast = useRef(null);

  useEffect(() => {
    fetchFeed();
    // setRefresh(props.refresh);
  }, []);

  const [feed, setFeed] = useState([]);
  const [page, setPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setloading] = useState(false);
  const [callOnScrollEnd, setCallOnScrollEnd] = useState(false);
  const [endReached, setEndReached] = useState(false);
  const [refresh, setRefresh] = useState(false);

  useEffect(() => {
    onRefreshFunction();
  }, []);

  const fetchFeed = async () => {
    setloading(true);
    const apiURL = ENV_CONFIG.EPNS_SERVER + ENV_CONFIG.ENDPOINT_GET_SPAM_FEEDS;

    const response = await fetch(apiURL, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user: wallet.toLowerCase(),
        page: page,
        pageSize: 10,
        op: 'read',
      }),
    });
    const resJson = await response.json();

    if (resJson.count != 0 && resJson.results != []) {
      const data = feed;
      // toast.current.show("New Notifications fetched");
      await setFeed([...data, ...resJson.results]);
      await setPage(page + 1);
      Toast.show('More Notifications Loaded.', 0.1);
    } else {
      setEndReached(true);
      Toast.show('No More Notifications.', Toast.SHORT);
    }
    setloading(false);
    setRefreshing(false);
  };

  const onRefreshFunction = async () => {
    setRefreshing(true);
    setFeed([]);
    setPage(1);
    setEndReached(false);
    fetchFeed();
  };

  return (
    <>
      <SafeAreaView style={styles.container}>
        {/* {feed != [] && ( */}
        <View style={{flex: 1}}>
          <FlatList
            data={feed}
            keyExtractor={item => item.payload_id.toString()}
            // onEndReached={() => {
            // 	console.log("END REACHED");
            // 	setloading(true);
            // }}
            initialNumToRender={10}
            style={{flex: 1}}
            showsVerticalScrollIndicator={false}
            // contentContainerStyle={{ marginBottom: 100 }}
            // onEndReachedThreshold={0.}
            // onMomentumScrollBegin={}
            // initialNumToRender={5}
            renderItem={({item}) => (
              <FeedItemComponent
                spam={true}
                loading={loading}
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
                privateKey={props.privateKey}
              />
            )}
            onEndReached={async () => (!endReached ? await fetchFeed() : null)}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => {
                  onRefreshFunction();
                }}
              />
            }
            ListEmptyComponent={
              feed == [] ? (
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
                      source={require('../../../assets/ui/feed.png')}
                    />
                    <StylishLabel
                      style={styles.infoText}
                      fontSize={16}
                      title="[dg:No New Notification!]"
                    />
                  </View>
                )
              ) : (
                <View style={[styles.infodisplay, styles.noPendingFeeds]}>
                  <Image
                    style={styles.infoIcon}
                    source={require('../../../assets/ui/feed.png')}
                  />
                  <StylishLabel
                    style={styles.infoText}
                    fontSize={16}
                    title="[dg: Hooray, No spam here!]"
                  />
                </View>
              )
            }
            ListFooterComponent={() => {
              return loading ? (
                <View style={{paddingBottom: 20, marginTop: 20}}>
                  <ActivityIndicator size="large" color="#000000" />
                </View>
              ) : null;
            }}
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
    width: '100%',
    backgroundColor: 'white',
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
