import React, { useState, useEffect } from "react";
import {
	StyleSheet,
	View,
	Text,
	Image,
	TouchableWithoutFeedback,
	ActivityIndicator,
	Easing,
	Animated,
} from "react-native";

import Swipeable from "react-native-gesture-handler/Swipeable";
import { ToasterOptions } from "src/components/indicators/Toaster";

import EPNSActivity from "src/components/loaders/EPNSActivity";

import FeedItem from "./FeedItemComponents";
import FeedDBHelper from "src/helpers/FeedDBHelper";

import GLOBALS from "src/Globals";

const FeedItemWrapper = (props) => {
	// // CONSTRUCTOR
	// constructor(props) {
	//   super(props);

	//   this.state = {
	//     deleting: false,
	//     scale: new Animated.Value(100),
	//     height: null,
	//     adjustedH: 0,
	//     collapsedH: null,
	//     initialized: false,

	//     collapsing: false,
	//     undo: false,
	//   }
	// }

	// // COMPONENT MOUNTED
	// componentDidMount() {

	// }

	// // COMPONENT UPDATED
	// componentDidUpdate(prevProps) {
	// }

	// // LAYOUT CHANGE
	// findDimensions = (layout) => {
	//   const {height} = layout;

	//   if (this.state.adjustedH < height && this.state.initialized == false) {
	//     this.setState({
	//       adjustedH: height,
	//       height: new Animated.Value(0),
	//       collapsedH: new Animated.Value(0),
	//       initialized: true,
	//     }, () => {
	//       Animated.timing(this.state.height, {
	//         toValue: height,
	//         easing: Easing.easeInOut,
	//       	duration: 250,
	//         // useNativeDriver: true, // No support for height
	//       }).start();
	//     });
	//   }
	// }

	// // Functions
	// onSwipeableRightWillOpen = () => {
	//   this.setState({
	//     deleting: true
	//   });
	// }

	// onSwipeableRightOpened = async (item, nid, itemArchivedFunc, showToast) => {
	//   let deleteObj = {};

	//   const db = FeedDBHelper.getDB();

	//   FeedDBHelper.hideFeedItem(db, item["nid"]).then(() => {
	//     this.animateHeightCollapse(nid, itemArchivedFunc);
	//   }).catch(err => {
	//     // Perform Event Edited Callback
	//     this.refs.SwipeRight.close();

	//     // Show Toast
	//     this.props.showToast("Error Archiving Notification", '', ToasterOptions.TYPE.GRADIENT_PRIMARY);
	//     // console.log(err);
	//   });
	// }

	// onSwipeableClose = () => {
	//   if (this.state.undo == true) {
	//     this.setState({
	//       undo: false,
	//       collapsing: false,
	//       deleting: false,
	//     })
	//   }
	// }

	// // Animated Height Collapse
	// animateHeightCollapse = (nid, itemArchivedFunc) => {
	//   this.setState({
	//     collapsing: true,
	//   }, () => {
	//     Animated.timing(this.state.height, {
	//       toValue: 0,
	//       easing: Easing.easeInOut,
	//       duration: 250,
	//       // useNativeDriver: true, // No support for height
	//     }).start(() => {
	//       // Perform Event Edited Callback
	//       if (itemArchivedFunc) {
	//         itemArchivedFunc(nid);
	//       }
	//     });
	//   })
	// }

	// // To uncollapse
	// uncollapseHeight = () => {
	//   this.setState({
	//     undo: true,
	//   }, () => {
	//     Animated.timing(this.state.height, {
	//       toValue: this.state.adjustedH,
	//       easing: Easing.easeInOut,
	//       duration: 250,
	//       // useNativeDriver: true, // No support for height
	//     }).start(() => {
	//       this.refs.SwipeRight.close();
	//     });
	//   })
	// }

	// Render Right Sliding Action
	// renderRightActions = (progress, dragX) => {
	//   const scaleIcon = dragX.interpolate({
	//     inputRange: [-200, 0],
	//     outputRange: [1, 0.4],
	//     extrapolate: 'clamp',
	//   });
	//   //
	//   // const transXIcon = dragX.interpolate({
	//   //   inputRange: [0, 50, 100, 101],
	//   //   outputRange: [5, 0, 0, 1],
	//   // });

	//   let scale = 0;

	//   if (this.state.height) {
	//     scale = this.state.height.interpolate({
	//       inputRange: [0, this.state.adjustedH],
	//       outputRange: [0, 1],
	//       extrapolate: 'clamp'
	//     });
	//   }

	//   return (
	//     <View
	//       style={[ styles.actionView ]}>
	//         {
	//         this.state.deleting
	//           ? <Animated.View
	//               style={[
	//                 styles.actionContentAfter,
	//                 {
	//                   transform: [
	//                     {
	//                       scale: scale
	//                     },
	//                   ]
	//                 }

	//               ]}

	//             >
	//               <EPNSActivity
	//                 style={styles.activity}
	//                 size="small"
	//               />
	//             </Animated.View>
	//           : <Animated.View style={[
	//               styles.actionContent,
	//               {
	//                 transform: [
	//                   {
	//                     scale: scaleIcon
	//                   }
	//                 ],

	//               },
	//             ]}>
	//               <Image
	//                 style={styles.actionImage}
	//                 source={require('assets/ui/archive.png')}
	//               />
	//             </Animated.View>
	//         }
	//     </View>
	//   );
	// };

	// RENDER
	// render() {
	// const {
	//   style,
	//   item,
	//   nid,
	//   itemArchived,
	//   showToast,
	//   onImagePreview,
	//   privateKey,
	// } = this.props;

	// let scale = 0;
	// let translateY = 0;
	// let fade = 0;
	// let height = undefined;

	// if (item["hidden"] == 1) {
	//   height = 0;
	//   fade = 0;
	// }

	// if (this.state.height) {
	//   scale = this.state.height.interpolate({
	//     inputRange: [0, this.state.adjustedH],
	//     outputRange: [0.6, 1],
	//     extrapolate: 'clamp'
	//   });

	//   translateY = this.state.height.interpolate({
	//     inputRange: [0.9, this.state.adjustedH],
	//     outputRange: [-this.state.adjustedH * 0.75, 0],
	//     extrapolate: 'clamp'
	//   });

	//   fade = this.state.height.interpolate({
	//     inputRange: [0, this.state.adjustedH/2, this.state.adjustedH],
	//     outputRange: [0, 0.1, 1],
	//     extrapolate: 'clamp'
	//   });
	// }

	// if (this.state.collapsing) {
	//   height = this.state.height;
	// }

	return (
		// <Swipeable
		//   style={styles.swipeContainer}
		//   ref="SwipeRight"
		//   renderRightActions={this.renderRightActions}
		//   onSwipeableRightWillOpen={this.onSwipeableRightWillOpen}
		//   onSwipeableRightOpen={() => this.onSwipeableRightOpened(
		//     item,
		//     nid,
		//     itemArchived,
		//     showToast
		//   )}
		//   onSwipeableClose={this.onSwipeableClose}
		// >
		//   <Animated.View
		//     style = {[
		//       styles.container,
		//       {
		//         height: height,
		//         opacity: fade,
		//         transform: [
		//           {
		//             scale: scale
		//           },
		//           {
		//             translateY: translateY,
		//           }
		//         ]
		//       }
		//     ]}
		//     onLayout = {(event) => { this.findDimensions(event.nativeEvent.layout) }}
		//   >
		<FeedItem
			loading={props.loading}
			item={props.item}
			// showToast={props.showToast}
			// onImagePreview={onImagePreview}
			// privateKey={privateKey}
		/>
		// </Animated.View>
		// </Swipeable>
	);
	// }
};

export default FeedItemWrapper;

const styles = StyleSheet.create({
	swipeContainer: {},
	container: {
		marginHorizontal: 20,
		alignItems: "center",
		shadowColor: GLOBALS.COLORS.BLACK,
		shadowOffset: {
			width: 0,
			height: 4,
		},
		shadowOpacity: 0.1,
		shadowRadius: 6,

		elevation: 4,
	},
	primaySegment: {
		flex: 1,
	},
	actionView: {
		flex: 1,
		width: "100%",
		justifyContent: "center",
	},
	actionContent: {
		flex: 1,
		alignSelf: "flex-end",
		justifyContent: "center",
		marginRight: 30,
	},
	actionImage: {
		width: 30,
		resizeMode: "contain",
	},
	actionContentAfter: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
	},
	actionActivity: {},
	actionText: {
		color: GLOBALS.COLORS.WHITE,
		fontSize: 10,
		fontWeight: "bold",
		textAlign: "center",
	},
});
