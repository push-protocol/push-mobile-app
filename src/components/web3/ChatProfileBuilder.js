import {getEncryptionPublicKey} from '@metamask/eth-sig-util';
import React, {useEffect, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import SafeAreaView from 'react-native-safe-area-view';
import GLOBALS from 'src/Globals';
import * as PushNodeClient from 'src/apis';
import ENSButton from 'src/components/buttons/ENSButton';
import Blockies from 'src/components/web3/Blockies';
import * as CaipHelper from 'src/helpers/CAIPHelper';
import {decryptWithWalletRPCMethod} from 'src/helpers/w2w/metamaskSigUtil';
import MetaStorage from 'src/singletons/MetaStorage';

const ChatProfileBuilder = ({style, wallet, pkey, setProfileComplete}) => {
  // Setup state
  const [indicator, setIndicator] = useState(true);

  useEffect(() => {
    (async () => {
      const caipAddress = CaipHelper.getCAIPAddress(wallet);
      const encryptionPublicKey = getEncryptionPublicKey(_pkey);

      let user = await PushNodeClient.getUser(caipAddress);

      // register if not reigistered
      if (!user) {
        console.log('Creating new user profile..........');
        user = await PushNodeClient.createNewPgpPair(
          caipAddress,
          encryptionPublicKey,
        );
      }

      // decript pgp from server
      const decryptedPrivateKey = decryptWithWalletRPCMethod(
        JSON.parse(user.encryptedPrivateKey),
        _pkey,
      );

      // store the user chatinfo
      await MetaStorage.instance.setUserChatData({
        pgpPrivateKey: decryptedPrivateKey,
        encryptionPublicKey: encryptionPublicKey,
      });

      setIndicator(false);
      setProfileComplete(true);
    })();
  });

  // RENDER
  return (
    <SafeAreaView style={[styles.container, style]}>
      <View style={styles.profile}>
        <View style={styles.profile}>
          <Blockies
            style={styles.blockies}
            seed={'wallet'.toLowerCase()} //string content to generate icon
            dimension={128} // blocky icon size
          />
          <ENSButton
            style={styles.ensbox}
            loading={indicator}
            cns={''}
            ens={'Profile Created'}
            wallet={wallet}
            fontSize={16}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

// Styling
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profile: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  blockies: {
    borderRadius: 128,
    borderWidth: 4,
    borderColor: GLOBALS.COLORS.LIGHT_GRAY,
    overflow: 'hidden',
    margin: 20,
  },
  profileErr: {
    justifyContent: 'flex-end',
    alignItems: 'center',
    flex: 1,
  },
  profileErrMsg: {
    alignSelf: 'flex-start',
    justifyContent: 'center',
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

export default ChatProfileBuilder;
