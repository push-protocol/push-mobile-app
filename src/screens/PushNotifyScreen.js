import React, { Component } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
} from 'react-native';
import SafeAreaView from 'react-native-safe-area-view';

import GLOBALS from 'src/Globals';

export default class PushNotifyScreen extends Component {
  // CONSTRUCTOR
  constructor(props) {
    super(props);
  }

  // COMPONENT MOUNTED
  componentDidMount() {

  }

  // FUNCTIONS

  // RENDER
  render() {
    const {
      style,
    } = this.props;

    return (
      <SafeAreaView style={[ styles.container, style ]}>
        <Text style={styles.header}>EPNS Introduction</Text>
        <View style={styles.inner}>
          <Image
            style={styles.logo}
            source={require('assets/ui/icon.png')}
          />
          <Image
            style={styles.logo}
            source={require('assets/ui/epns.png')}
          />
        </View>

      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: GLOBALS.COLORS.WHITE,
  },
});
