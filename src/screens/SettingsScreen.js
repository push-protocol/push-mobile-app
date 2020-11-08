import React, { Component } from 'react';
import {
  View,
  Text,
  Image,
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
import { ToasterOptions, Toaster } from 'src/components/indicators/Toaster';

import Web3Helper from 'src/helpers/Web3Helper';
import AuthenticationHelper from 'src/helpers/AuthenticationHelper'
import MetaStorage from 'src/singletons/MetaStorage';

import FeedDBHelper from 'src/helpers/FeedDBHelper';

import AuthContext, {APP_AUTH_STATES} from 'src/components/auth/AuthContext';
import ENV_CONFIG from 'src/env.config';
import GLOBALS from 'src/Globals';

export default class SettingsScreen extends Component {
  // CONSTRUCTOR
  constructor(props) {
    super(props);
  }

  // COMPONENT MOUNTED
  componentDidMount() {

  }

  // ADD HEADER COMPONENET
  addHeaderComponent = (navigation) => {
    navigation.setOptions({
      headerLeft: (() => {
        return null;
      }),
    });
  }

  // FUNCTIONS
  // To Unarchive Message
  unarchiveMessages = async () => {
    const db = FeedDBHelper.getDB();
    await FeedDBHelper.unhideAllFeedItems(db);

    // Change the header back
    this.addHeaderComponent(this.props.navigation);

    this.showToast("Messages Unarchived! Restarting...", "", ToasterOptions.TYPE.GRADIENT_PRIMARY);

    setTimeout(() => {
      const { handleAppAuthState } = this.context;
      handleAppAuthState(APP_AUTH_STATES.ONBOARDED);
    }, 1500);
  }

  // To Reset Wallet
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

  // TO SHOW TOASTER
  showToast = (msg, icon, type, tapCB, screenTime) => {
    this.refs.Toaster.showToast(msg, icon, type, tapCB, screenTime);
  }

  // RENDER
  render() {

    // CONSTANTS
    const settingsOptions = [
      {
        title: 'Unarchive Messages',
        img: require('assets/ui/unarchive.png'),
        func: () => {
          this.unarchiveMessages();
        },
        type: 'button',
      }, {
        title: 'Swipe / Reset Wallet',
        img: require('assets/ui/unlink.png'),
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
            style={styles.settingsContainer}
          >
            <FlatList
              style={styles.settings}
              bounces={true}
              data={settingsOptions}
              keyExtractor={item => item.title}
              renderItem={this.renderItem}
            />
            <View style={styles.appInfo}>
              <Text style={styles.appText}>{`Ethereum Push Notification Service(Alpha) v${ENV_CONFIG.APP_VERSION}`}</Text>
              <Image style={styles.appImage} source={require('assets/ui/fulllogo.png')} />
            </View>
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

        {/* Toaster Always goes here in the end after safe area */}
        <Toaster
          ref = 'Toaster'
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
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    backgroundColor: GLOBALS.COLORS.WHITE,
  },
  settingsContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  settings: {

  },
  appInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 5,
    paddingHorizontal: 15,
    marginLeft: 80,
  },
  appImage: {
    height: 40,
    width: 60,
    resizeMode: 'contain',
    padding: 10,
  },
  appText: {
    flex: 1,
    padding: 10,
    textAlign: 'right',
    fontSize: 12,
    color: GLOBALS.COLORS.MID_GRAY,
  }
});
