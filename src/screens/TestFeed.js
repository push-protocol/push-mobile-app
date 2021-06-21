import React, { useEffect, useState } from "react";
import {
	View,
	Text,
	TouchableOpacity,
	StyleSheet,
	FlatList,
	Image,
	RefreshControl,
	Dimensions,
} from "react-native";

import FeedItemWrapper from "src/components/ui/testFeed/FeedItemWrapperComponent.js";
import EPNSActivity from "src/components/loaders/EPNSActivity";
import StylishLabel from "src/components/labels/StylishLabel";

import ENV_CONFIG from "src/env.config";
import { ActivityIndicator } from "react-native";

export default function TestFeed(props) {
	const DEVICE_HEIGHT = Dimensions.get("window").height;
	useEffect(() => {
		fetchFeed();
	}, []);

	const [feed, setFeed] = useState([]);
	const [page, setPage] = useState(1);
	const [refreshing, setRefreshing] = useState(false);
	const [loading, setloading] = useState(false);
	const [callOnScrollEnd, setCallOnScrollEnd] = useState(false);
	const [endReached, setEndReached] = useState(false);

	const fetchFeed = async () => {
		if (!endReached) {
			setloading(true);
			const apiURL = ENV_CONFIG.EPNS_SERVER + ENV_CONFIG.ENDPOINT_GET_FEEDS;

			const wallet = props.route.params.wallet;
			const response = await fetch(apiURL, {
				method: "POST",
				headers: {
					Accept: "application/json",
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					user: wallet.toLowerCase(),
					page: page,
					pageSize: 5,
					op: "read",
				}),
			});
			const resJson = await response.json();
			console.log(resJson);
			if (resJson.count != 0 && resJson.results != []) {
				const data = feed;
				setFeed([...data, ...resJson.results]);
				setPage(page + 1);
			} else {
				setEndReached(true);
			}
			setloading(false);
			setRefreshing(false);
		}
		// console.log(feed);
	};

	return (
		<View>
			{feed != [] && (
				<View>
					<FlatList
						data={feed}
						keyExtractor={(item) => item.payload_id}
						// onEndReached={() => {
						// 	console.log("END REACHED");
						// 	setloading(true);
						// }}
						style={{ height: DEVICE_HEIGHT * 0.8 }}
						// contentContainerStyle={{ marginBottom: 100 }}
						onEndReachedThreshold={0.1}
						initialNumToRender={5}
						renderItem={({ item }) => (
							<FeedItemWrapper
								// ref={(ref) =>
								// 	(this.itemRefs = {
								// 		...this.itemRefs,
								// 		[this.getRefForFeedItem(item["nid"])]: ref,
								// 	})
								// }
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
						onEndReached={() => (!endReached ? fetchFeed() : null)}
						refreshControl={
							<RefreshControl
								refreshing={refreshing}
								onRefresh={() => {
									if (!endReached) {
										setRefreshing(true);
										fetchFeed();
									}
									// this.triggerGetItemsFromDB();
									// setTimeout(() => {
									// 	setRefreshing(false);
									// }, 3000);
								}}
							/>
						}
					/>
					{loading && (
						<View>
							<ActivityIndicator size="large" color="#0000000" />
						</View>
					)}
				</View>
			)}
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
		</View>
	);
}
