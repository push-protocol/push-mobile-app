import React, { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import MetaStorage from 'src/singletons/MetaStorage';
import PrimaryButton from 'src/components/buttons/PrimaryButton';

import AuthContext, {APP_AUTH_STATES} from 'src/components/auth/AuthContext';
import GLOBALS from 'src/Globals';

export default class HomeScreen extends Component {
  // CONSTRUCTOR
  constructor(props) {
    super(props);
  }

  // COMPONENT MOUNTED
  async componentDidMount() {
    await this.maintener();
  }

  // FUNCTIONS
  // Authentication, etc Maintainer Function
  maintener = async () => {
    // Since User is logged in, reset passcode attempts
    await MetaStorage.instance.setRemainingPasscodeAttempts(
      GLOBALS.CONSTANTS.MAX_PASSCODE_ATTEMPTS
    );

  }

  // RESET WALLET
  resetWallet = async () => {
    await MetaStorage.instance.resetSignedInUser();

    const { handleAppAuthState } = this.context;
    handleAppAuthState(APP_AUTH_STATES.INITIALIZING, '');
  }

  // LOCK ACCOUNT
  secureApp = async () => {
    const { handleAppAuthState } = this.context;
    handleAppAuthState(APP_AUTH_STATES.ONBOARDED, '');
  }

  // RENDER
  render() {
    const {
    } = this.props;

    const {
      pkey
    } = this.props.route.params;

    return (
      <View style = { styles.container }>
        <SafeAreaView>
          <Text>Hello World!</Text>
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
          <PrimaryButton
            iconFactory='Ionicons'
            icon='ios-power'
            iconSize={24}
            title='Secure App'
            fontSize={16}
            fontColor={GLOBALS.COLORS.WHITE}
            bgColor={GLOBALS.COLORS.GRADIENT_THIRD}
            disabled={false}
            onPress={() => {this.secureApp()}}
          />
        <Text>Pkey is {pkey}</Text>
        </SafeAreaView>
      </View>
    );
  }
}

// Connect to Auth Context
HomeScreen.contextType = AuthContext;

// Styling
const styles = StyleSheet.create({
  container: {
    height: '100%',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: GLOBALS.COLORS.WHITE,
  },
});
