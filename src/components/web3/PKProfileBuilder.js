import React, { Component } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import SafeAreaView from 'react-native-safe-area-view';

import GLOBALS from 'src/Globals';

export default class PKProfileBuilder extends Component {
  // CONSTRUCTOR
  constructor(props) {
    super(props);

    this.state = {
      indicator: true
    }
  }

  // COMPONENT MOUNTED
  componentDidMount() {
    this.prepareProfile(this.props.forPKey);
  }

  // FUNCTIONS
  prepareProfile = (forPKey) => {

  }

  // RENDER
  render() {
    const {
      style,
      forPKey,
    } = this.props;

    return (
      <SafeAreaView style={[ styles.container, style ]}>
        <ActivityIndicator
          style = {styles.activity}
          size = "large"
          color = {GLOBALS.COLORS.GRADIENT_PRIMARY}
        />
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'red',
  },
});
