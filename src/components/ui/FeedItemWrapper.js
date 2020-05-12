import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableWithoutFeedback,
  ActivityIndicator,
  Easing,
  Animated,
} from 'react-native';

import Swipeable from 'react-native-gesture-handler/Swipeable';
import { ToasterOptions } from 'src/components/indicators/Toaster';

import EPNSActivity from 'src/components/loaders/EPNSActivity';

import FeedItem from 'src/components/ui/FeedItem';
import FeedDBHelper from 'src/helpers/FeedDBHelper';

import GLOBALS from 'src/Globals';

export default class FeedItemWrapper extends Component {
  // CONSTRUCTOR
  constructor(props) {
    super(props);

    this.state = {
      itemid: null,
      itemstartdate: null,
      deleting: false,
      scale: new Animated.Value(100),
      layourHeight: 0,

      hidden: false,
    }
  }

  // COMPONENT MOUNTED
  componentDidMount() {
    this.setState({
      itemid: this.props.item.id,
      itemstartdate: this.props.item.startDate
    });
  }

  // COMPONENT UPDATED
  componentDidUpdate(prevProps) {
    // Check and update props here
    if (
        this.props.item.id !== prevProps.item.id
        || this.props.item.startDate !== prevProps.item.startDate
      ) {
      this.setState({
        itemid: this.props.item.id,
        itemstartdate: this.props.item.startDate
      });
    }
  }

  // Functions
  onSwipeableRightWillOpen = () => {
    this.setState({
      deleting: true
    });
  }

  onSwipeableRightOpened = async (item, nid, itemArchivedFunc, showToast) => {
    let deleteObj = {};

    const db = FeedDBHelper.getDB();

    FeedDBHelper.hideFeedItem(db, item["nid"]).then(() => {
      this.animateHeightCollapse(nid, itemArchivedFunc);
    }).catch(err => {
      // Perform Event Edited Callback
      this.refs.SwipeRight.close();

      // Show Toast
      showToast("Error Archiving Notification", ToasterOptions.TYPE.GRADIENT_PRIMARY);
      // console.log(err);
    });
  }

  onSwipeableWillClose = () => {
    if (this.state.deleting) {
      this.refs.SwipeRight.openRight();
    }
  }

  // Animated Height Collapse
  animateHeightCollapse = (nid, itemArchivedFunc) => {
    Animated.timing(this.state.scale, {
      toValue: 0,
      easing: Easing.easeInOut,
      duration: 250,
      seNativeDriver: true,
    }).start(() => {
      this.setState({
        hidden: true,
      })

      // Perform Event Edited Callback
      if (itemArchivedFunc) {
        itemArchivedFunc(nid);
      }
    });
  }

  // Render Right Sliding Action
  renderRightActions = (progress, dragX) => {
    const scale = dragX.interpolate({
      inputRange: [-200, 0],
      outputRange: [1, 0.4],
      extrapolate: 'clamp',
    });

    const trans = dragX.interpolate({
      inputRange: [0, 50, 100, 101],
      outputRange: [-5, 0, 0, 1],
    });

    return (
      <View
        style={[ styles.actionView ]}>
          {
          this.state.deleting
            ? <Animated.View
                style={[
                  styles.actionContentAfter,
                  {
                    transform: [
                      {
                        scale: this.state.scale.interpolate({
                                  inputRange: [0, 25, 50, 75, 100],
                                  outputRange: [0, .5, 0.75, 0.9, 1]
                                })
                      },
                    ]
                  }
                ]}

              >
                <EPNSActivity
                  style={styles.activity}
                  size="small"
                />
              </Animated.View>
            : <Animated.View style={[
                styles.actionContent,
                {
                  transform: [
                    {
                      scale: scale
                    }
                  ],

                },
              ]}>
                <Image
                  style={styles.actionImage}
                  source={require('assets/ui/archive.png')}
                />
              </Animated.View>
          }
      </View>
    );
  };

  // RENDER
  render() {
    const {
      style,
      item,
      nid,
      itemArchived,
      showToast,
      onImagePreview,
      privateKey,
    } = this.props;

    let displayStyle = {};
    if (item["hidden"] || this.state.hidden) {
      displayStyle.display = 'none';
    }

    return (
      <Swipeable
        ref="SwipeRight"
        renderRightActions={this.renderRightActions}
        onSwipeableRightWillOpen={this.onSwipeableRightWillOpen}
        onSwipeableRightOpen={() => this.onSwipeableRightOpened(
          item,
          nid,
          itemArchived,
          showToast
        )}
      >
        <Animated.View
          style = {[
            styles.container,
            displayStyle,
            {
              transform: [
                {
                  scale: this.state.scale.interpolate({
                            inputRange: [0, 25, 50, 75, 100],
                            outputRange: [0, .5, 0.75, 0.9, 1]
                          })
                }
              ]
            }
          ]}
        >
          <FeedItem

            item={item}
            showToast={showToast}
            onImagePreview={onImagePreview}
            privateKey={privateKey}
          />
        </Animated.View>
      </Swipeable>

    );
  }
}

const styles = StyleSheet.create({
  swipeContainer: {
  },
  container: {
    alignItems: 'center',
    marginHorizontal: 20,
    marginVertical: 15,
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
    width: '100%',
    justifyContent: 'center',
  },
  actionContent: {
    flex: 1,
    alignSelf: 'flex-end',
    justifyContent: 'center',
    marginRight: 30
  },
  actionImage: {
    width: 30,
    resizeMode: 'contain',
  },
  actionContentAfter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionActivity: {
    marginBottom: 5,
  },
  actionText: {
    color: GLOBALS.COLORS.WHITE,
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center'
  },
});
