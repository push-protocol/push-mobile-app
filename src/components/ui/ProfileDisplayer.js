import React, { Component } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import MaskedView from '@react-native-community/masked-view';
import { LinearGradient } from 'expo-linear-gradient';

import StylishLabel from 'src/components/labels/StylishLabel';
import PrimaryButton from 'src/components/buttons/PrimaryButton';
import EPNSActivity from 'src/components/loaders/EPNSActivity';

import Blockies from 'src/components/web3/Blockies';
import ENSButton from 'src/components/buttons/ENSButton';

import Web3Helper from 'src/helpers/Web3Helper';

import AuthContext, {APP_AUTH_STATES} from 'src/components/auth/AuthContext';
import GLOBALS from 'src/Globals';

export default class ProfileDisplayer extends Component {
  // CONSTRUCTOR
  constructor(props) {
    super(props);

    this.state = {
      ens: '',
      loading: true,
      active: false,
    }
  }

  // COMPONENT MOUNTED
  async componentDidMount() {
    const walletObject = await Web3Helper.updateENSAndFetchWalletInfoObject();
    let ens = '';

    if (walletObject.ens !== '') {
      ens = walletObject.ens;
    }

    this.setState({
      ens: ens,
      loading: false,
    })
  }

  // To toggle Active Status
  toggleActive = (toggle) => {
    this.setState({
      active: toggle
    })

    if (this.props.toggleBlur) {
      this.props.toggleBlur(toggle, true);
    }
  }

  // RENDER
  render() {
    const {
      style,
      wallet,
      lockApp,
      toggleBlur
    } = this.props;

    return (
      <View style={[ styles.container, style ]}>
        <TouchableOpacity
          style={[ styles.header ]}
          onPress={() => {
            this.toggleActive(!this.state.active);
          }}
        >

          <Blockies
            style={styles.blockies}
            seed={wallet.toLowerCase()} //string content to generate icon
            dimension={40} // blocky icon size
          />
          <ENSButton
            style={styles.ens}
            innerStyle={styles.ensbox}
            loading={this.state.loading}
            ens={this.state.ens}
            wallet={wallet}
            fontSize={14}
            forProfile={true}
            />

        </TouchableOpacity>
        {
          this.state.active == false
            ? null
            : <View style={ styles.activeProfile }>

                <View style={styles.upArrow} />


                <View style={styles.content}>

                  <View style={styles.walletInfo}>
                    <StylishLabel
                      style={styles.para}
                      fontSize={16}
                      title='[third:Connected Wallet]'
                    />
                    <Text style={styles.walletText}>
                      {wallet}
                    </Text>
                  </View>

                  <View style={styles.interestEarned}>
                    <View style={styles.interestEarnedTitle}>
                      <MaskedView
                        style={styles.maskedView}
                        maskElement={
                          <View style={styles.maskedElementView}>
                            <Text style={styles.maskedTitle}>
                              Interest Earned
                            </Text>
                          </View>
                        }
                      >
                        <LinearGradient
                          colors={[
                            GLOBALS.COLORS.GRADIENT_PRIMARY,
                            GLOBALS.COLORS.GRADIENT_SECONDARY,
                          ]}
                          style={styles.fullgradient}
                          start={[0.1, 0.3]}
                          end={[1, 1]}
                        >
                        </LinearGradient>
                      </MaskedView>
                    </View>
                    <View style={styles.interestEarnedText}>
                      <EPNSActivity
                        style={styles.activity}
                        size="small"
                      />
                    </View>
                  </View>

                  <View style={styles.settings}>
                    <PrimaryButton
                      iconFactory='Ionicons'
                      icon='md-lock'
                      iconSize={24}
                      title='Lock App'
                      fontSize={16}
                      fontColor={GLOBALS.COLORS.WHITE}
                      bgColor={GLOBALS.COLORS.GRADIENT_PRIMARY}
                      disabled={false}
                      onPress={() => {lockApp()}}
                    />
                  </View>
                </View>
              </View>
        }
      </View>
    );
  }
};

// Styling
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'center',

    marginRight: 20,
    maxWidth: 540,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: GLOBALS.ADJUSTMENTS.SCREEN_GAP_VERTICAL,
    marginLeft: GLOBALS.ADJUSTMENTS.SCREEN_GAP_HORIZONTAL/2,
  },
  blockies: {
    borderRadius: 32,
    borderWidth: 1,
    borderColor: GLOBALS.COLORS.LIGHT_GRAY,
    overflow: 'hidden',
    marginRight: 10,
  },
  ens: {
    flex: 1,
    alignItems: 'flex-start',
    marginBottom: 0,
    padding: 0,
  },
  ensbox: {
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  activeProfile: {
    position: 'absolute',
    backgroundColor: GLOBALS.COLORS.WHITE,
    top: 65,
    left: 15,
    borderRadius: 10,
    shadowColor: GLOBALS.COLORS.BLACK,
    shadowOffset: {
    	width: 0,
    	height: 5,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,

    elevation: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    flex: 1,
    marginLeft: 5,
  },
  headerActive: {
    marginTop: GLOBALS.ADJUSTMENTS.SCREEN_GAP_VERTICAL/2,
    marginRight: GLOBALS.ADJUSTMENTS.SCREEN_GAP_HORIZONTAL,
  },
  blockiesActive: {
    marginTop: 4,
    marginLeft: 4,
  },
  closeIcon: {
    alignSelf: 'center',
    backgroundColor: GLOBALS.COLORS.LIGHT_GRAY,
    paddingTop: 1,
    paddingHorizontal: 10,
    borderRadius: 15,
    overflow: 'hidden',
  },
  content: {
    marginTop: GLOBALS.ADJUSTMENTS.SCREEN_GAP_VERTICAL,
    marginBottom: GLOBALS.ADJUSTMENTS.SCREEN_GAP_VERTICAL,
    marginHorizontal: GLOBALS.ADJUSTMENTS.SCREEN_GAP_HORIZONTAL,
  },
  walletInfo: {
    padding: 10,
    backgroundColor: GLOBALS.COLORS.LIGHT_GRAY,
    borderRadius: GLOBALS.ADJUSTMENTS.DEFAULT_MID_RADIUS,
    marginBottom: 10,
  },
  upArrow: {
    position: 'absolute',
    top: -8,
    left: 3,
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderBottomWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: GLOBALS.COLORS.WHITE,
  },
  walletText: {
    marginTop: 10,
    color: GLOBALS.COLORS.DARK_GRAY,
    marginBottom: 5,
  },
  interestEarned: {
    marginVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  interestEarnedTitle: {
    flex: 1,
  },
  maskedView: {
    flex: 1,
    height: '100%',
  },
  maskedElementView: {
    backgroundColor: 'transparent',
    flex: 1,
    alignItems: 'center',
    flexDirection: 'row',
  },
  maskedTitle: {
    color: 'black',
    fontWeight: 'bold'
  },
  fullgradient: {
    height: 20,
    flex: 1,
  },
  interestEarnedText: {

  },
  settings: {
    marginTop: 10,
  }
});
