import React, { Component } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
} from 'react-native';
import SafeAreaView from 'react-native-safe-area-view';

import ProfileDisplayer from 'src/components/ui/ProfileDisplayer';
import ImageButton from 'src/components/buttons/ImageButton';
import PrimaryButton from 'src/components/buttons/PrimaryButton';

import ImageTitleButton from 'src/components/buttons/ImageTitleButton';
import ImageTitleSwitchButton from 'src/components/buttons/ImageTitleSwitchButton';

import OverlayBlur from 'src/components/modals/OverlayBlur';

import Web3Helper from 'src/helpers/Web3Helper';
import AuthenticationHelper from 'src/helpers/AuthenticationHelper'
import MetaStorage from 'src/singletons/MetaStorage';

import AuthContext, {APP_AUTH_STATES} from 'src/components/auth/AuthContext';
import GLOBALS from 'src/Globals';

export default class SettingsScreen extends Component {
  // CONSTRUCTOR
  constructor(props) {
    super(props);
  }

  // COMPONENT MOUNTED
  componentDidMount() {

  }

  // FUNCTIONS
  // TO RESET WALLET
  resetWallet = async () => {
    await AuthenticationHelper.resetSignedInUser();

    const { handleAppAuthState } = this.context;
    handleAppAuthState(APP_AUTH_STATES.INITIALIZING);
  }

  renderItem = ({item}) => {
    if (item.type === 'button') {
      return (
        <ImageTitleButton
          title = {item.title}
          img = {item.img}
          onPress = {item.func}
        />
      );
    }
    else if (item.type === 'switch') {
      return (
        <ImageTitleSwitchButton
          title = {item.title}
          img = {item.img}
          onPress = {item.func}
          isOn = {item.isOn}
          onSwitchOnFunc = {item.onSwitchOnFunc}
          onSwitchOffFunc = {item.onSwitchOffFunc}
        />
      );
    }
    else {
      return null;
    }
  }

  // RENDER
  render() {

    // CONSTANTS
    const settingsOptions = [
      {
        title: 'Unarchive Messages',
        img: require('assets/ui/unlink.png'),
        func: () => {

        },
        type: 'button',
      }, {
        title: 'Swipe / Reset Wallet',
        img: require('assets/ui/unarchive.png'),
        func: () => {
          this.resetWallet();
        },
        type: 'button',
      }
    ];

    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.container}>
          <View
            style = {styles.settingsContainer}
          >
            <FlatList
              bounces = {false}
              data = {settingsOptions}
              keyExtractor = {item => item.title}
              renderItem = {this.renderItem}
            />
          </View>
        </SafeAreaView>

        {/* Overlay Blur to show incase need to emphasize on something */}
        <OverlayBlur
          ref='OverlayBlur'
          onPress={
            ()=>{
              this.exitIntentOnOverleyBlur()
            }
          }
        />
      </View>
    );
  }
}

// Connect to Auth Context
SettingsScreen.contextType = AuthContext;

// Styling
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
