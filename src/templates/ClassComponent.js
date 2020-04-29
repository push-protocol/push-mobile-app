import React, { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import SafeAreaView from 'react-native-safe-area-view';

import GLOBALS from 'src/Globals';

export default class ClassComponent extends Component {
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
        <Text>I am Dummy</Text>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
  },
});
