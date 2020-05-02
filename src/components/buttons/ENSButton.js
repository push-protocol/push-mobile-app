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

    return (
      <View style={[ styles.container, style ]}>
        <TouchableOpacity
          onPress = {this.onPress}
          disabled={!showENS}
        >
          <LinearGradient
            colors={[
              GLOBALS.COLORS.GRADIENT_PRIMARY,
              GLOBALS.COLORS.GRADIENT_SECONDARY,
            ]}
            style={styles.ensbox}
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
                  ? <Text style={[ styles.ensName, { fontSize: fontSize} ]}>{title}</Text>
                  : <View
                      style={styles.ensContainer}
                    >
                      <View style={styles.ensHeader}>
                        <Text style={[ styles.ensName, { fontSize: fontSize} ]}>{title}</Text>
                        <Ionicons
                          style={styles.ensIcon}
                          name={icon}
                          color={GLOBALS.COLORS.WHITE}
                          size={fontSize * 1.2}
                        />
                      </View>
                      {
                        this.state.active == false
                          ? null
                          : <View style={styles.ensContent}>
                              <Text style={[ styles.ensContentInner, { fontSize: fontSize} ]}>{wallet}</Text>
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

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  ensbox: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginBottom: 20,
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
    borderRadius: 10,
    marginVertical: 5,
  },
  ensContentInner: {
    fontSize: 16,
    color: GLOBALS.COLORS.BLACK,
    fontWeight: 'bold',
  }
});
