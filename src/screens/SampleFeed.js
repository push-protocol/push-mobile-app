import React from "react";
import { View, Text, FlatList } from "react-native";
import FeedItemComponent from "src/components/ui/testFeed/FeedItemComponents.js";
import EPNSActivity from "src/components/loaders/EPNSActivity";
import StylishLabel from "src/components/labels/StylishLabel";
import { SafeAreaView } from "react-native-safe-area-context";
const feed = [
  {
    payload_id: 1,
    channel: "0x0b5E9fa12C4C1946fA2f14b7271cC60541508f23",
    // epoch: "2021-07-01T11:44:27.000Z",
    payload: {
      apns: {
        payload: {
          aps: {
            category: "withappicon",
            "mutable-content": 1,
            "content-available": 1,
          },
        },
        fcm_options: {
          image:
            "https://backend-prod.epns.io/cache/bafkreibzn4s6nfa4jwyuswkojxclec5nhvj3e4ac5cvamzc2ajznh7t77a.jpg",
        },
      },
      data: {
        app: "App Bot",
        sid: "22710",
        url: "https://epns.io/",
        acta: "",
        aimg: "",
        amsg: "[b:Greetings] fellow users! Welcome aboard!\n\nI am your personalized [d:App Bot] whose sole purpose is to guide you about the app.",
        asub: "Welcome to EPNS",
        icon: "https://backend-prod.epns.io/cache/bafkreibzn4s6nfa4jwyuswkojxclec5nhvj3e4ac5cvamzc2ajznh7t77a.jpg",
        type: "1",
        // epoch: "1625139867",
        appbot: "1",
        hidden: "0",
        secret: "",
      },
      android: {
        notification: {
          icon: "@drawable/ic_stat_name",
          color: "#e20880",
          image:
            "https://backend-prod.epns.io/cache/bafkreibzn4s6nfa4jwyuswkojxclec5nhvj3e4ac5cvamzc2ajznh7t77a.jpg",
          default_vibrate_timings: true,
        },
      },
      notification: {
        body: "\nHourly Movement: 0.33%\nDaily Movement: 4.66%\nWeekly Movement: 14.91%",
        title: "ETH Tracker - ETH at $2,216.38",
      },
    },
  },
  {
    payload_id: 2,
    channel: "0x0b5E9fa12C4C1946fA2f14b7271cC60541508f23",
    // epoch: "2021-07-01T11:44:27.000Z",
    payload: {
      apns: {
        payload: {
          aps: {
            category: "withappicon",
            "mutable-content": 1,
            "content-available": 1,
          },
        },
        fcm_options: {
          image:
            "https://backend-prod.epns.io/cache/bafkreibzn4s6nfa4jwyuswkojxclec5nhvj3e4ac5cvamzc2ajznh7t77a.jpg",
        },
      },
      data: {
        app: "App Bot",
        sid: "22710",
        url: "https://epns.io/",
        acta: "",
        aimg: "",
        amsg: "[d:Channels] represent your favorite [b:dApps] or [b:Smart Contracts]. You will often get notifications from different channels.\n\nThe [b:top section] of the message contains information about these channels.\n\n[b:Clicking on it] takes you to their [b:website].",
        asub: "About Channels",
        icon: "https://backend-prod.epns.io/cache/bafkreibzn4s6nfa4jwyuswkojxclec5nhvj3e4ac5cvamzc2ajznh7t77a.jpg",
        type: "1",
        // epoch: "1625139867",
        appbot: "1",
        hidden: "0",
        secret: "",
      },
      android: {
        notification: {
          icon: "@drawable/ic_stat_name",
          color: "#e20880",
          image:
            "https://backend-prod.epns.io/cache/bafkreibzn4s6nfa4jwyuswkojxclec5nhvj3e4ac5cvamzc2ajznh7t77a.jpg",
          default_vibrate_timings: true,
        },
      },
      notification: {
        body: "\nHourly Movement: 0.33%\nDaily Movement: 4.66%\nWeekly Movement: 14.91%",
        title: "ETH Tracker - ETH at $2,216.38",
      },
    },
  },
  {
    payload_id: 3,
    channel: "0x0b5E9fa12C4C1946fA2f14b7271cC60541508f23",
    // epoch: "2021-07-01T11:44:27.000Z",
    payload: {
      apns: {
        payload: {
          aps: {
            category: "withappicon",
            "mutable-content": 1,
            "content-available": 1,
          },
        },
        fcm_options: {
          image:
            "https://backend-prod.epns.io/cache/bafkreibzn4s6nfa4jwyuswkojxclec5nhvj3e4ac5cvamzc2ajznh7t77a.jpg",
        },
      },
      data: {
        app: "App Bot",
        sid: "22710",
        url: "https://epns.io/",
        acta: "",
        aimg: "https://backend-prod.epns.io/assets/epnsappbellturorial.jpg",
        amsg: "The [d:Bell] on the [b:top right] keeps track of any incoming messages and will inform you about it.\n\nClicking on the [b:bell] will update your feed [i:(Alternatively, pull feed down to refresh)]",
        asub: "Ring the Bell",
        icon: "https://backend-prod.epns.io/cache/bafkreibzn4s6nfa4jwyuswkojxclec5nhvj3e4ac5cvamzc2ajznh7t77a.jpg",
        type: "1",
        // epoch: "1625139867",
        appbot: "1",
        hidden: "0",
        secret: "",
      },
      android: {
        notification: {
          icon: "@drawable/ic_stat_name",
          color: "#e20880",
          image:
            "https://backend-prod.epns.io/cache/bafkreibzn4s6nfa4jwyuswkojxclec5nhvj3e4ac5cvamzc2ajznh7t77a.jpg",
          default_vibrate_timings: true,
        },
      },
      notification: {
        body: "\nHourly Movement: 0.33%\nDaily Movement: 4.66%\nWeekly Movement: 14.91%",
        title: "ETH Tracker - ETH at $2,216.38",
      },
    },
  },
  {
    payload_id: 4,
    channel: "0x0b5E9fa12C4C1946fA2f14b7271cC60541508f23",
    // epoch: "2021-07-01T11:44:27.000Z",
    payload: {
      apns: {
        payload: {
          aps: {
            category: "withappicon",
            "mutable-content": 1,
            "content-available": 1,
          },
        },
        fcm_options: {
          image:
            "https://backend-prod.epns.io/cache/bafkreibzn4s6nfa4jwyuswkojxclec5nhvj3e4ac5cvamzc2ajznh7t77a.jpg",
        },
      },
      data: {
        app: "App Bot",
        sid: "22710",
        url: "https://epns.io/",
        acta: "https://epns.io",
        aimg: "",
        amsg: "Notifications are [b:never boring] in EPNS.\n\nThe messages with [b:blueish outlines] are links that the [b:dApp] has provided you. \n\n[d:Tapping the message opens it.]",
        asub: "Nofications Types",
        icon: "https://backend-prod.epns.io/cache/bafkreibzn4s6nfa4jwyuswkojxclec5nhvj3e4ac5cvamzc2ajznh7t77a.jpg",
        type: "1",
        // epoch: "1625139867",
        appbot: "1",
        hidden: "0",
        secret: "",
      },
      android: {
        notification: {
          icon: "@drawable/ic_stat_name",
          color: "#e20880",
          image:
            "https://backend-prod.epns.io/cache/bafkreibzn4s6nfa4jwyuswkojxclec5nhvj3e4ac5cvamzc2ajznh7t77a.jpg",
          default_vibrate_timings: true,
        },
      },
      notification: {
        body: "\nHourly Movement: 0.33%\nDaily Movement: 4.66%\nWeekly Movement: 14.91%",
        title: "ETH Tracker - ETH at $2,216.38",
      },
    },
  },
  // {
  // 	payload_id: 5,
  // 	channel: "0x0b5E9fa12C4C1946fA2f14b7271cC60541508f23",
  // 	// epoch: "2021-07-01T11:44:27.000Z",
  // 	payload: {
  // 		apns: {
  // 			payload: {
  // 				aps: {
  // 					category: "withappicon",
  // 					"mutable-content": 1,
  // 					"content-available": 1,
  // 				},
  // 			},
  // 			fcm_options: {
  // 				image:
  // 					"https://backend-prod.epns.io/cache/bafkreibzn4s6nfa4jwyuswkojxclec5nhvj3e4ac5cvamzc2ajznh7t77a.jpg",
  // 			},
  // 		},
  // 		data: {
  // 			app: "App Bot",
  // 			sid: "22710",
  // 			url: "https://epns.io/",
  // 			acta: "",
  // 			aimg: "",
  // 			amsg: "The [d:coolest type] of messages are [t:secrets]. They are indicated by the [bi:shush gradient] on the top left of the message box.\n\nThey are always [d:encrypted] and [b:only you] can see them.",
  // 			asub: "Secrets... shhh!!!",
  // 			icon: "https://backend-prod.epns.io/cache/bafkreibzn4s6nfa4jwyuswkojxclec5nhvj3e4ac5cvamzc2ajznh7t77a.jpg",
  // 			type: "-2",
  // 			// epoch: "1625139867",
  // 			appbot: "1",
  // 			hidden: "0",
  // 			secret: "",
  // 		},
  // 		android: {
  // 			notification: {
  // 				icon: "@drawable/ic_stat_name",
  // 				color: "#e20880",
  // 				image:
  // 					"https://backend-prod.epns.io/cache/bafkreibzn4s6nfa4jwyuswkojxclec5nhvj3e4ac5cvamzc2ajznh7t77a.jpg",
  // 				default_vibrate_timings: true,
  // 			},
  // 		},
  // 		notification: {
  // 			body: "\nHourly Movement: 0.33%\nDaily Movement: 4.66%\nWeekly Movement: 14.91%",
  // 			title: "ETH Tracker - ETH at $2,216.38",
  // 		},
  // 	},
  // },
];

export default function SampleFeed() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        <FlatList
          data={feed}
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
      </View>
    </SafeAreaView>
  );
}
