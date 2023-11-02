import {decryptPGPKey} from '@kalashshah/react-native-sdk/src';
import {ethers} from 'ethers';
import React, {useEffect, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import SafeAreaView from 'react-native-safe-area-view';
import GLOBALS from 'src/Globals';
import * as PushNodeClient from 'src/apis';
import ENSButton from 'src/components/buttons/ENSButton';
import Blockies from 'src/components/web3/Blockies';
import envConfig from 'src/env.config';
import * as CaipHelper from 'src/helpers/CAIPHelper';
import useChat from 'src/navigation/screens/chats/helpers/useChat';
import MetaStorage from 'src/singletons/MetaStorage';

const ChatProfileBuilder = ({style, wallet, pkey, setProfileComplete}) => {
  // Setup state
  const [indicator, setIndicator] = useState(true);
  const {createNewPgpPair} = useChat();

  useEffect(() => {
    (async () => {
      try {
        const caipAddress = CaipHelper.getCAIPAddress(wallet);

        let user = await PushNodeClient.getUser(caipAddress);

        // register if not reigistered
        if (!user || user.encryptedPrivateKey === '') {
          user = await createNewPgpPair(caipAddress);
        }

        const signer = new ethers.Wallet(pkey);

        const decryptedPrivateKey = await decryptPGPKey({
          encryptedPGPPrivateKey: user.encryptedPrivateKey,
          account: signer.address,
          signer: signer,
          env: envConfig.ENV,
        });

        if (decryptedPrivateKey === undefined) {
          throw new Error('Could not decrypt private key');
        }

        // store the user chatinfo
        await MetaStorage.instance.setUserChatData({
          pgpPrivateKey: decryptedPrivateKey,
          encryptionPublicKey: user.publicKey,
        });

        setIndicator(false);
        setProfileComplete(true);
      } catch (error) {
        console.log('got errosr', error);
      }
    })();
  }, []);

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
