import React, { Component } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import GLOBALS from 'src/Globals';

export default class ENSButton extends Component<Prop> {
  // CONSTRUCTOR
  constructor(props) {
    super(props);

    this.state = {
      active: false
    }
  }

  // FUNCTIONS
  // On Press Function
  onPress = () => {
    // Change State to reflect expanded or contracted button
    this.setState({
      active: !this.state.active
    });
  }

  // Set Render
  render() {
    const {
      style,
      innerStyle,
      forProfile,
      loading,
      ens,
      wallet,
      fontSize
    } = this.props;

    let showENS = true;
    let title = ens;

    if (ens === '') {
      showENS = false;
      title = wallet;
    }

    let icon = 'ios-arrow-down';
    if (this.state.active) {
      icon = 'ios-arrow-up';
    }

    // Set number of lines and font size
    let numberOfLines = 0;

    // Set Gradient to show
    let gradient = [
      GLOBALS.COLORS.GRADIENT_PRIMARY,
      GLOBALS.COLORS.GRADIENT_SECONDARY,
    ]

    // To set header text style
    let headerTextStyle = {
      fontWeight: 'bold'
    }

    // To override loading style if need be
    let loadingContainerStyle = {};

    // If For Profile, then change few visuals
    // Focus on ENS Name, Make address as single line, etc
    let headerStyle = {};
    if (forProfile) {
      numberOfLines = 1;
      headerStyle.marginRight = 0;

      if (!showENS && !loading) {
        // Colored look better
        // gradient = [
        //   GLOBALS.COLORS.MID_GRAY,
        //   GLOBALS.COLORS.LIGHT_GRAY,
        // ]

        // headerTextStyle={
        //   color: GLOBALS.COLORS.DARK_BLACK_TRANS,
        //   fontWeight: '300',
        // }

        headerTextStyle={
          color: GLOBALS.COLORS.WHITE,
          fontWeight: '400',
        }
      }

      if (loading) {
        loadingContainerStyle = {
          paddingVertical: 8,
          borderRadius: 18,
        }
      }
    }

    return (
      <View style={[ styles.container, style ]}>
        <TouchableOpacity
          onPress = {this.onPress}
          disabled={!showENS || forProfile}
        >
          <LinearGradient
            colors={gradient}
            style={[ styles.ensbox, innerStyle, loadingContainerStyle ]}
            start={[0.1, 0.3]}
            end={[1, 1]}
          >
            {
              loading == true
                ? <ActivityIndicator
                    style = {styles.activity}
                    size = "small"
                    color = {GLOBALS.COLORS.WHITE}
                  />
                : showENS == false
                  ? <Text
                      style={[ styles.ensName, { fontSize: fontSize}, headerTextStyle ]}
                      numberOfLines={numberOfLines}
                      ellipsizeMode="middle"
                    >
                      {title}
                    </Text>
                  : <View
                      style={styles.ensContainer}
                    >
                      <View style={[ styles.ensHeader, headerStyle ]}>
                        <Text
                          style={[ styles.ensName, { fontSize: fontSize} ]}
                          numberOfLines={numberOfLines}
                        >
                          {title}
                        </Text>
                        {
                          forProfile == true
                            ? null
                            : <Ionicons
                                style={styles.ensIcon}
                                name={icon}
                                color={GLOBALS.COLORS.WHITE}
                                size={fontSize * 1.2}
                              />
                        }
                      </View>
                      {
                        this.state.active == false
                          ? null
                          : <View style={styles.ensContent}>
                              <Text
                                style={[ styles.ensContentInner, { fontSize: fontSize} ]}
                              >
                                {wallet}
                              </Text>
                            </View>
                      }
                    </View>
            }
          </LinearGradient>
        </TouchableOpacity>
      </View>
    );
  };
}

// Styling
const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  ensbox: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  ensName: {
    fontSize: 16,
    color: GLOBALS.COLORS.WHITE,
    fontWeight: 'bold',
  },
  ensContainer: {

  },
  ensHeader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: -5,
  },
  ensIcon: {
    marginLeft: 5,
    alignSelf: 'center',
    paddingVertical: 2,
    paddingHorizontal: 5,
    alignItems: 'center',
  },
  ensContent: {
    backgroundColor: GLOBALS.COLORS.LIGHT_GRAY,
    padding: 10,
    borderRadius: GLOBALS.ADJUSTMENTS.DEFAULT_BIG_RADIUS,
    marginVertical: 5,
  },
  ensContentInner: {
    fontSize: 16,
    color: GLOBALS.COLORS.BLACK,
    fontWeight: 'bold',
  }
});
