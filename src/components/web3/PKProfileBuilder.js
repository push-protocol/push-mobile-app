import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import SafeAreaView from 'react-native-safe-area-view';
import GLOBALS from 'src/Globals';
import ENSButton from 'src/components/buttons/ENSButton';
import PrimaryButton from 'src/components/buttons/PrimaryButton';
import StylishLabel from 'src/components/labels/StylishLabel';
import Blockies from 'src/components/web3/Blockies';
import Web3Helper from 'src/helpers/Web3Helper';

const PKProfileBuilder = ({
  style,
  profileKey,
  profileType,
  resetFunc,
  profileInfoFetchedFunc,
}) => {
  // Setup state
  const [indicator, setIndicator] = useState(true);
  const [errored, setErrored] = useState(false);

  const [wallet, setWallet] = useState('');
  const [blockchainNamingServiceFetched, setBlockchainNamingServiceFetched] =
    useState(-1);

  const [ens, setENS] = useState('');
  const [cns, setCNS] = useState('');

  // FUNCTIONAL COMPONENT MOUNTED
  useEffect(() => {
    prepareProfile(profileKey, profileType);
  }, []);

  useEffect(() => {
    if (blockchainNamingServiceFetched == 0 && wallet) {
      fetchBNSFunc();
    }

    async function fetchBNSFunc() {
      const provider = await Web3Helper.getWeb3Provider();

      const ensResponse = await Web3Helper.getENSReverseDomain(
        wallet,
        provider,
      );
      let ens = '';

      if (ensResponse.success) {
        ens = ensResponse.ens;
      }

      const cnsResponse = await Web3Helper.getCNSReverseDomain(wallet);
      let cns = '';

      if (cnsResponse.success) {
        cns = cnsResponse.cns;
      }

      setCNS(cns);
      setENS(ens);
      setBlockchainNamingServiceFetched(1);

      if (profileInfoFetchedFunc) {
        profileInfoFetchedFunc(wallet, cns, ens);
      }
    }
  }, [blockchainNamingServiceFetched, wallet]);

  // FUNCTIONS
  const prepareProfile = async (profileKey, profileType) => {
    let response = {};

    // Fetch Provider to use for Web3 and ENS
    const provider = await Web3Helper.getWeb3Provider();

    if (profileType === GLOBALS.CONSTANTS.CRED_TYPE_WALLET) {
      // do some brushing up
      if (profileKey.startsWith('ethereum:')) {
        // Metamask does this
        profileKey = profileKey.replace('ethereum:', '');
      }

      // Next verify wallet
      response = {
        success: true,
        wallet: profileKey,
      };
    } else if (profileType === GLOBALS.CONSTANTS.CRED_TYPE_PRIVATE_KEY) {
      // Get Wallet Address
      response = await Web3Helper.getWalletAddress(profileKey, provider);
    }

    if (response.success) {
      // Get Identicon And try to fetch ENS
      const wallet = response.wallet;

      setIndicator(false);
      setWallet(wallet);
      setBlockchainNamingServiceFetched(0);
    } else {
      setIndicator(false);
      setErrored(true);
    }
  };

  // RENDER
  return (
    <SafeAreaView style={[styles.container, style]}>
      {indicator == true ? (
        <ActivityIndicator
          style={styles.activity}
          size="small"
          color={GLOBALS.COLORS.GRADIENT_THIRD}
        />
      ) : null}
      <View style={styles.profile}>
        {errored == true ? (
          <View style={styles.profileErr}>
            <View style={styles.profileErrMsg}>
              <StylishLabel
                style={styles.para}
                fontSize={16}
                title="[d:Error:] Unable to fetch [d:wallet] for the given creds."
              />

              <StylishLabel
                style={styles.paraend}
                fontSize={16}
                title="This might happen when you scan [b:incorrect QR Code] or [b:make a typo]."
              />
            </View>

            <PrimaryButton
              style={styles.reset}
              iconFactory="Ionicons"
              icon="ios-refresh"
              iconSize={24}
              title="Reset / Use Different Wallet"
              fontSize={16}
              fontColor={GLOBALS.COLORS.WHITE}
              bgColor={GLOBALS.COLORS.GRADIENT_PRIMARY}
              disabled={false}
              onPress={resetFunc}
            />
          </View>
        ) : (
          <View style={styles.profile}>
            <Blockies
              style={styles.blockies}
              seed={wallet.toLowerCase()} //string content to generate icon
              dimension={128} // blocky icon size
            />

            <ENSButton
              style={styles.ensbox}
              loading={!blockchainNamingServiceFetched}
              cns={cns}
              ens={ens}
              wallet={wallet}
              fontSize={16}
            />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

// Styling
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
  },
  profile: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
  },
  blockies: {
    borderRadius: 128,
    borderWidth: 4,
    borderColor: GLOBALS.COLORS.LIGHT_GRAY,
    overflow: "hidden",
    margin: 20,
  },
  profileErr: {
    justifyContent: "flex-end",
    alignItems: "center",
    flex: 1,
  },
  profileErrMsg: {
    alignSelf: "flex-start",
    justifyContent: "center",
    flex: 1,
  },
  paratop: {
    marginBottom: 0,
  },
  para: {
    marginBottom: 20,
  },
  paraend: {},
  reset: {
    marginBottom: 10,
  },
});

export default PKProfileBuilder;
