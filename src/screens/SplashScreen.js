import React, { Component } from 'react';
import {
  View,
  Image,
  StyleSheet,
} from 'react-native';

import AnimatedEpnsIcon from 'src/components/custom/AnimatedEpnsIcon';

import MetaStorage from "src/singletons/MetaStorage";
import GLOBALS from 'src/Globals';

export default class SplashScreen extends Component {
  // CONSTRUCTOR
  constructor(props) {
    super(props);
  }

  async componentDidMount() {
    const signedIn = await MetaStorage.instance.getIsSignedIn();

    // Do The Bell Once and then proceed
    this.refs.bellicon.animateBell(
      () => {this.loadNextScreen()}
    );
  }

  // FUNCTIONS
  // To Load the next screen
  loadNextScreen = (signedIn) => {
    const {
      setIsSignedIn,
      setIsLoading
    } = this.props.route.params;

    setIsSignedIn(signedIn);
    setIsLoading(false);
  }

  // RENDER
  render() {
    return (
      <View style={styles.container}>
        <AnimatedEpnsIcon
          ref='bellicon'
          style={styles.logo}
        />
      </View>
    );
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: GLOBALS.COLORS.WHITE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 96,
    resizeMode: 'contain',
  }
});
