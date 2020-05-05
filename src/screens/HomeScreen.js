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

  // Overlay Blur exit intent
  exitIntentOnOverleyBlur = () => {
    this.refs.ProfileDisplayer.toggleActive(false);
  }

  // RENDER
  render() {
    const {
      navigation,
    } = this.props;

    const {
      wallet,
      pkey
    } = this.props.route.params;

    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.headerContainer}>
          <View style={styles.header}>
            {/* Header Comes Here */}
            <ProfileDisplayer
              ref="ProfileDisplayer"
              style={styles.profile}
              wallet={wallet}
              lockApp={() => {
                const { handleAppAuthState } = this.context;
                handleAppAuthState(APP_AUTH_STATES.ONBOARDED);
              }}
              toggleBlur={(toggle, animate) => {
                this.refs.OverlayBlur.changeRenderState(toggle, animate);
              }}
            />

            <ImageButton
              style={styles.settings}
              src={require('assets/ui/settings.png')}
              onPress={() => {
                navigation.navigate('Settings', {

                });
              }}
            />
          </View>
        </SafeAreaView>

        <SafeAreaView style={styles.container}>
          <View style={styles.content}>
            <Text>Hello World!</Text>
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
HomeScreen.contextType = AuthContext;

// Styling
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContainer: {
    flex: 0,
    justifyContent: 'center',
    alignItems: 'center',

    zIndex: 999,
  },
  header: {
    flexDirection: 'row',
    marginLeft: GLOBALS.ADJUSTMENTS.SCREEN_GAP_HORIZONTAL/2, // For Profile Adjustment
    marginRight: GLOBALS.ADJUSTMENTS.SCREEN_GAP_HORIZONTAL,
    marginBottom: GLOBALS.ADJUSTMENTS.SCREEN_GAP_VERTICAL,
    marginHorizontal: GLOBALS.ADJUSTMENTS.SCREEN_GAP_HORIZONTAL,

    zIndex: 999,
  },
  profile: {

  },
  settings: {
    marginTop: GLOBALS.ADJUSTMENTS.SCREEN_GAP_HORIZONTAL,
    width: 28,
    height: 28,
  },
  content: {
    flex: 1,
    alignContent: 'center',
    justifyContent: 'center',
  }
});
