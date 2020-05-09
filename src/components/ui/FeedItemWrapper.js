// import React, { Component } from 'react';
// import {
//   StyleSheet,
//   View,
//   Text,
//   Image,
//   TouchableWithoutFeedback,
//   ActivityIndicator,
//   Easing,
//   Animated,
// } from 'react-native';
// import InsetShadow from 'react-native-inset-shadow';
//
// import {ToasterOptions} from '../../progress/Toaster';
//
// import GLOBALS from '../../../global/Globals';
//
// export default class FeedItemWrapper extends Component {
//   // CONSTRUCTOR
//   constructor(props) {
//     super(props);
//
//     this.state = {
//       itemid: null,
//       itemstartdate: null,
//       deleting: false,
//       height: new Animated.Value(GLOBALS.ADJUSTMENTS.CALENDAR_EVENT_DISPLAY_HEIGHT),
//       textColor: GLOBALS.COLORS.BLACK,
//     }
//   }
//
//   // COMPONENT MOUNTED
//   componentDidMount() {
//     this.setState({
//       itemid: this.props.item.id,
//       itemstartdate: this.props.item.startDate
//     });
//   }
//
//   // COMPONENT UPDATED
//   componentDidUpdate(prevProps) {
//     // Check and update props here
//     if (
//         this.props.item.id !== prevProps.item.id
//         || this.props.item.startDate !== prevProps.item.startDate
//       ) {
//       this.setState({
//         itemid: this.props.item.id,
//         itemstartdate: this.props.item.startDate
//       });
//     }
//   }
//
//   // Functions
//   // When Item is sliding
//   renderRightActions = (progress, dragX) => {
//     const scale = dragX.interpolate({
//       inputRange: [-200, 0],
//       outputRange: [1, 0.4],
//       extrapolate: 'clamp',
//     });
//
//     return (
//       <View
//         style={[
//           styles.actionView
//         ]}>
//           {
//           this.state.deleting
//             ? <View style={styles.actionContentAfter}>
//                 <ActivityIndicator
//                   style = {styles.actionActivity}
//                   size = "small"
//                   color = {GLOBALS.COLORS.WHITE}
//                 />
//                 <Text style = {styles.actionText}>Deleting</Text>
//               </View>
//             : <Animated.View style={[
//                 styles.actionContent,
//                 {
//                   transform: [{ scale }],
//                 },
//               ]}>
//                 <Image
//                     style = {styles.actionImage}
//                     source = {require('../../../../assets/ui/delete.png')}
//                   />
//               </Animated.View>
//           }
//       </View>
//     );
//   };
//
//   onSwipeableRightWillOpen = () => {
//     this.setState({
//       deleting: true
//     });
//   }
//
//   onSwipeableRightOpened = async (eventDeletedCallback, showToasterCallback) => {
//     let deleteObj = {};
//
//     if (Device.osName == 'iOS') {
//       deleteObj = {
//         instanceStartDate: this.state.itemstartdate,
//         futureEvents: false
//       };
//     }
//
//     Calendar.deleteEventAsync(
//       this.state.itemid,
//       deleteObj
//     ).then(() => {
//       this.animateHeightCollapse(eventDeletedCallback);
//     }).catch(err => {
//       // Perform Event Edited Callback
//       this.refs.SwipeRight.close();
//
//       // Show Toast
//       showToasterCallback("Error deleting Event", ToasterOptions.TYPE.ERROR);
//       console.log(err);
//     });
//   }
//
//   onSwipeableWillClose = () => {
//     if (this.state.deleting) {
//       this.refs.SwipeRight.openRight();
//     }
//   }
//
//   // Animated Height Collapse
//   animateHeightCollapse = (eventDeletedCallback) => {
//     Animated.timing(this.state.height, {
//       toValue: 0,
//       easing: Easing.easeInOut,
//       duration: 250
//     }).start(() => {
//       // Perform Event Edited Callback
//       eventDeletedCallback();
//     });
//   }
//
//   // When Item is Pressed
//   onItemPressed = (item, eventPressedCallback) => {
//     // Callback for item
//     eventPressedCallback(item);
//   }
//
//   // Return
//   render() {
//     const {
//       style,
//       item,
//       eventDeletedCallback,
//       eventPressedCallback,
//       showToasterCallback
//     } = this.props;
//
//     return (
//       <Swipeable
//         ref = "SwipeRight"
//         renderRightActions = {this.renderRightActions}
//         onSwipeableRightWillOpen = {this.onSwipeableRightWillOpen}
//         onSwipeableRightOpen = {() => this.onSwipeableRightOpened(
//           eventDeletedCallback,
//           showToasterCallback
//         )}
//       >
//         <TouchableWithoutFeedback
//           style = {styles.touchableContainer}
//           onPress = {() => this.onItemPressed(item, eventPressedCallback)}
//           onPressIn = {() => {
//             this.setState({
//               textColor: GLOBALS.COLORS.DARK_BLACK_TRANS
//             })
//           }}
//           onPressOut = {() => {
//             this.setState({
//               textColor: GLOBALS.COLORS.BLACK
//             })
//           }}
//         >
//
//           <Animated.View style = {[ styles.container, {height: this.state.height} ]}>
//
//           </Animated.View>
//
//         </TouchableWithoutFeedback>
//       </Swipeable>
//     );
//   }
// }
//
// const styles = StyleSheet.create({
//   actionView: {
//     flex: 1,
//     backgroundColor: GLOBALS.COLORS.SUBLIME_RED,
//     justifyContent: 'center',
//   },
//   actionContent: {
//     flex: 1,
//     alignSelf: 'flex-end',
//     justifyContent: 'center',
//     marginRight: GLOBALS.ADJUSTMENTS.BORDER_MARGIN_SIDE
//   },
//   actionImage: {
//     width: 30,
//     resizeMode: 'contain',
//   },
//   actionContentAfter: {
//     flex: 1,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   actionActivity: {
//     marginBottom: 5,
//   },
//   actionText: {
//     color: GLOBALS.COLORS.WHITE,
//     fontSize: 10,
//     fontWeight: 'bold',
//     textAlign: 'center'
//   },
//   touchableContainer: {
//     flex: 1,
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   container: {
//     flex: 1,
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: GLOBALS.COLORS.WHITE,
//     height: GLOBALS.ADJUSTMENTS.CALENDAR_EVENT_DISPLAY_HEIGHT,
//   },
//   timeSegment: {
//     width: 80,
//     paddingVertical: 10,
//     justifyContent: 'center',
//     overflow: 'hidden',
//   },
//   primaySegment: {
//     flex: 1,
//   },
//   primaryText: {
//     paddingVertical: 10,
//     paddingHorizontal: 10,
//     fontSize: 14,
//   },
//   countdownSegment: {
//     marginHorizontal: 10,
//     justifyContent: 'center',
//   },
//   underline: {
//     position: 'absolute',
//     height: 1,
//     left: 40,
//     right: 40,
//     bottom: 0,
//     borderBottomWidth: 1,
//     borderColor: GLOBALS.COLORS.LIGHT_GRAY
//   }
// });
