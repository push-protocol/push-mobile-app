import React, { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';

import MetaStorage from 'src/singletons/MetaStorage';

import GLOBALS from 'src/Globals';

export default class HomeScreen extends Component {
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
    } = this.props;

    return (
      <View style = { styles.container }>
        <Text>I am Dummy</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: GLOBALS.COLORS.WHITE,
  },
});
