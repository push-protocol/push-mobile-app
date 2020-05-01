import React, { Component } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import SafeAreaView from 'react-native-safe-area-view';

import Web3 from 'web3';

import StylishLabel from 'src/components/labels/StylishLabel';
import PrimaryButton from 'src/components/buttons/PrimaryButton';

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
      ens: '',
    }
  }

  // COMPONENT MOUNTED
  componentDidMount() {
    this.prepareProfile(this.props.forPKey);
  }

  // FUNCTIONS
  prepareProfile = async (forPKey) => {
    console.log(forPKey);

    const web3 = new Web3(new Web3.providers.HttpProvider(``))
    const response = await Web3Helper.getWalletAddress(web3, forPKey);

    if (response.error) {
      this.setState({
        indicator: false,
        errored: true,
      });
    }
    else {
      // Get Identicon
      const wallet = response.wallet;
      this.setState({
        indicator: false,
        wallet: wallet.toLowerCase()
      }, () => {
        // get ens

      })
    }

  }

  getProfileAddress = async (web3, forPKey) => {

  }

  // RENDER
  render() {
    const {
      style,
      forPKey,
      resetFunc,
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
            ? <React.Fragment>
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
              </React.Fragment>
            : <View style={styles.profile}>
                <Blockies
                  style={styles.blockies}
                  seed={this.state.wallet} //string content to generate icon
                  dimension={196} // blocky icon size
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
  para: {
    marginBottom: 20,
  },
  reset: {
    marginTop: 10,
  },
  blockies: {
    borderRadius: 128,
    overflow: 'hidden',
  }
});
