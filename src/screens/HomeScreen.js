import React, { Component } from 'react';
import { StyleSheet, View, Text } from 'react-native';

import GLOBALS from 'src/Globals';

export default class ClassComponent extends Component<Prop> {
  // CONSTRUCTOR
  constructor(props) {
    super(props);
  }

  // COMPONENT MOUNTED
  componentDidMount() {
    console.log("here");
  }

  // FUNCTIONS


  // RENDER
  render() {
    const {
      style,
    } = this.props;

    return (
      <View style = {[ styles.container, style ]}>
        <Text>I am Dummy</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
  },
});
