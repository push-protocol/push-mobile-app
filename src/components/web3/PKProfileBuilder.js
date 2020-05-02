import React, { Component } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import SafeAreaView from 'react-native-safe-area-view';
import { LinearGradient } from 'expo-linear-gradient';

import StylishLabel from 'src/components/labels/StylishLabel';
import PrimaryButton from 'src/components/buttons/PrimaryButton';
import ENSButton from 'src/components/buttons/ENSButton';

import Blockies from 'src/components/web3/Blockies';
import Web3Helper from 'src/helpers/Web3Helper';

import GLOBALS from 'src/Globals';

export default class PKProfileBuilder extends Component {
  // CONSTRUCTOR
  constructor(props) {
    super(props);

    this.state = {
      indicator: true,
      errored: false,

      wallet: '',

      ensFetched: -1, // -1 is not yet fetched, 0 is fetching and 1 is fetched
      ens: '',
    }
  }

  // COMPONENT MOUNTED
  componentDidMount() {
    this.prepareProfile(this.props.forPKey);
  }

  // FUNCTIONS
  prepareProfile = async (forPKey) => {
    // Fetch Provider to use for Web3 and ENS
    const provider = Web3Helper.getWeb3Provider();

    // Get Wallet Address
    const response = await Web3Helper.getWalletAddress(forPKey, provider);

    if (response.error) {
      this.setState({
        indicator: false,
        errored: true,
      });
    }
    else {
      // Get Identicon And try to fetch ENS
      const wallet = response.wallet;

      this.setState({
        indicator: false,
        wallet: wallet,
        ensFetched: 0,
      });

      const ensResponse = await Web3Helper.getENSReverseDomain(wallet, provider);
      let ens = '';

      if (!ensResponse.error) {
        ens = ensResponse.ens;
      }

      this.setState({
        ensFetched: 1,
        ens: ens
      }, () => {
        if (this.props.profileInfoFetchedFunc) {
          this.props.profileInfoFetchedFunc(wallet, ens);
        }
      })
    }

  }

  // RENDER
  render() {
    const {
      style,
      forPKey,
      resetFunc,
      profileInfoFetchedFunc
    } = this.props;

    return (
      <SafeAreaView style={[ styles.container, style ]}>
        {
          this.state.indicator == true
            ? <ActivityIndicator
                style = {styles.activity}
                size = "small"
                color = {GLOBALS.COLORS.GRADIENT_THIRD}
              />
            : null
        }
        <View style={styles.profile}>
        {
          this.state.errored == true
            ? <View style={styles.error}>
                <StylishLabel
                  style={styles.para}
                  fontSize={16}
                  title='[default:Error:] Unable to fetch Wallet address for the given creds.'
                />

                <StylishLabel
                  style={styles.para}
                  fontSize={16}
                  title='This might happen when you scan [bold:incorrect QR Code] or [bold:make a typo].'
                />

                <PrimaryButton
                  style={styles.reset}
                  iconFactory='Ionicons'
                  icon='ios-refresh'
                  iconSize={24}
                  title='Reset / Use Different Wallet'
                  fontSize={16}
                  fontColor={GLOBALS.COLORS.WHITE}
                  bgColor={GLOBALS.COLORS.GRADIENT_PRIMARY}
                  disabled={false}
                  onPress={resetFunc}
                />
            </View>
            : <View style={styles.profile}>
                <Blockies
                  style={styles.blockies}
                  seed={this.state.wallet.toLowerCase()} //string content to generate icon
                  dimension={128} // blocky icon size
                />

                <ENSButton
                  style={styles.ensbox}
                  loading={!this.state.ensFetched}
                  ens={this.state.ens}
                  wallet={this.state.wallet}
                  fontSize={16}
                />

              </View>

        }
        </View>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  paratop: {
    marginBottom: 0,
  },
  para: {
    marginBottom: 20,
  },
  profile: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  blockies: {
    borderRadius: 128,
    borderWidth: 4,
    borderColor: GLOBALS.COLORS.LIGHT_GRAY,
    overflow: 'hidden',
    margin: 20,
  },
  reset: {
    marginTop: 10,
  },
});
