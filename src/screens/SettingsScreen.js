import React, { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import SafeAreaView from 'react-native-safe-area-view';

import ProfileDisplayer from 'src/components/ui/ProfileDisplayer';
import ImageButton from 'src/components/buttons/ImageButton';
import PrimaryButton from 'src/components/buttons/PrimaryButton';

import OverlayBlur from 'src/components/modals/OverlayBlur';

import Web3Helper from 'src/helpers/Web3Helper';
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
    await MetaStorage.instance.resetSignedInUser();

    const { handleAppAuthState } = this.context;
    handleAppAuthState(APP_AUTH_STATES.INITIALIZING);
  }

  // RENDER
  render() {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.container}>
          <PrimaryButton
            iconFactory='Ionicons'
            icon='ios-refresh'
            iconSize={24}
            title='Reset / Use New Wallet'
            fontSize={16}
            fontColor={GLOBALS.COLORS.WHITE}
            bgColor={GLOBALS.COLORS.GRADIENT_THIRD}
            disabled={false}
            onPress={() => {this.resetWallet()}}
          />
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
