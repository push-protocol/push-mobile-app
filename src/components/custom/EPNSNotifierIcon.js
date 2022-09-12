import React, {Component} from 'react';
import {
  View,
  Image,
  Animated,
  TouchableOpacity,
  Text,
  StyleSheet,
} from 'react-native';

import AnimatedEPNSIcon from 'src/components/custom/AnimatedEPNSIcon';
import AppBadgeHelper from 'src/helpers/AppBadgeHelper';
import MetaStorage from 'src/singletons/MetaStorage';

import GLOBALS from 'src/Globals';

export default class EPNSNotifierIcon extends Component {
  // CONSTRUCTOR
  constructor(props) {
    super(props);

    this.state = {
      badge: 0,
      fader: new Animated.Value(0),
    };
  }

  // COMPONENT MOUNTED
  componentDidMount() {}

  // FUNCTIONS
  // To get badge count
  getBadgeCountAndRefresh = async () => {
    const newBadge = await MetaStorage.instance.getBadgeCount();
    const prevBadge = await MetaStorage.instance.getPreviousBadgeCount();

    if (newBadge != prevBadge) {
      this.refs.bell.animateBell(() => {
        // Call on New Notification
        if (this.props.onNewNotifications) {
          this.props.onNewNotifications();
        }

        // Set the badge after animation
        this.setAndAnimatedBadge(newBadge - prevBadge, prevBadge);
      });
    } else {
      // Just set the badge
      this.setAndAnimatedBadge(newBadge - prevBadge, prevBadge);
    }
  };

  // To Animate and show badge count
  // AnimateBadge
  setAndAnimatedBadge = async (badgeCount, prevBadgeCount) => {
    // Update on Meta Storage as well
    await MetaStorage.instance.setCurrentAndPreviousBadgeCount(
      badgeCount,
      prevBadgeCount,
    );

    // Set app badge count as well
    AppBadgeHelper.setAppBadgeCount(badgeCount);

    // Open / Animation logic
    let shouldOpen = false;
    if (badgeCount > 0) {
      shouldOpen = true;
    }

    if (shouldOpen == true) {
      this.setState({
        badge: badgeCount,
      });

      Animated.timing(this.state.fader, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(this.state.fader, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start(() => {
        this.setState({
          badge: badgeCount,
        });
      });
    }
  };

  // Handle Press
  handleOnPress = async onPressFunc => {
    if (onPressFunc) {
      onPressFunc();
    }

    // Reset Badge Count to 0 and Previous to 0
    this.setAndAnimatedBadge(0, 0);
  };

  // RENDER
  render() {
    const {style, iconSize, onPress, onNewNotifications} = this.props;

    let onPressFunc = onPress;
    let disabled = false;
    if (!onPressFunc) {
      onPressFunc = null;
      disabled = true;
    }

    return (
      <View style={[styles.container, style]}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            // Handle on press
            this.handleOnPress(onPressFunc);
          }}>
          <Animated.View
            style={[styles.badgeContainer, {opacity: this.state.fader}]}
            pointerEvents="none">
            <Text style={styles.badge} numberOfLines={1}>
              {this.state.badge}
            </Text>
          </Animated.View>
          <AnimatedEPNSIcon
            ref="bell"
            style={[styles.icon, {width: iconSize}]}
            withoutRinger={true}
          />
        </TouchableOpacity>
      </View>
    );
  }
}

// Styling
const styles = StyleSheet.create({
  container: {
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    flex: 1,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    width: 32,
  },
  badgeContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  badge: {
    position: 'absolute',
    top: 8,
    left: -4,
    backgroundColor: GLOBALS.COLORS.BADGE_RED,
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 10,
    overflow: 'hidden',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 12,
    color: GLOBALS.COLORS.WHITE,
  },
});
