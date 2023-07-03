import {getEncryptionPublicKey} from '@metamask/eth-sig-util';
import {
  getEip191Signature,
  getEip712Signature,
} from '@pushprotocol/restapi/src/lib/chat/helpers';
import {ENCRYPTION_TYPE} from '@pushprotocol/restapi/src/lib/constants';
import {ethers} from 'ethers';
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
import {decryptV2} from 'src/walletconnect/chat/aes';
import {hexToBytes} from 'src/walletconnect/chat/utils';

const ChatProfileBuilder = ({style, wallet, pkey, setProfileComplete}) => {
  // Setup state
  const [indicator, setIndicator] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const caipAddress = CaipHelper.getCAIPAddress(wallet);
        const encryptionPublicKey = getEncryptionPublicKey(pkey);

        let user = await PushNodeClient.getUser(caipAddress);

        // register if not reigistered
        if (!user || user.encryptedPrivateKey === '') {
          user = await PushNodeClient.createNewPgpPair(
            caipAddress,
            encryptionPublicKey,
          );
        }

        const {version: encryptionType} = JSON.parse(user.encryptedPrivateKey);

        let decryptedPrivateKey;
        const signer = new ethers.Wallet(pkey);
        const walletSigner = {
          address: signer.address,
          signer: signer,
        };

        switch (encryptionType) {
          case ENCRYPTION_TYPE.PGP_V1: {
            // decript pgp from server
            decryptedPrivateKey = decryptWithWalletRPCMethod(
              JSON.parse(user.encryptedPrivateKey),
              pkey,
            );
            break;
          }
          case ENCRYPTION_TYPE.PGP_V2: {
            const {preKey: input} = JSON.parse(user.encryptedPrivateKey);
            const enableProfileMessage = 'Enable Push Chat Profile \n' + input;
            let encodedPrivateKey;
            try {
              const {verificationProof: secret} = await getEip712Signature(
                walletSigner,
                enableProfileMessage,
                true,
              );
              encodedPrivateKey = await decryptV2(
                JSON.parse(user.encryptedPrivateKey),
                hexToBytes(secret || ''),
              );
            } catch (err) {
              const {verificationProof: secret} = await getEip712Signature(
                walletSigner,
                enableProfileMessage,
                false,
              );
              encodedPrivateKey = await decryptV2(
                JSON.parse(user.encryptedPrivateKey),
                hexToBytes(secret || ''),
              );
            }
            const dec = new TextDecoder();
            decryptedPrivateKey = dec.decode(encodedPrivateKey);
            break;
          }
          case ENCRYPTION_TYPE.PGP_V3: {
            const {preKey: input} = JSON.parse(user.encryptedPrivateKey);
            const enableProfileMessage = 'Enable Push Profile \n' + input;
            const {verificationProof: secret} = await getEip191Signature(
              walletSigner,
              enableProfileMessage,
              'v1',
            );
            const encodedPrivateKey = await decryptV2(
              JSON.parse(user.encryptedPrivateKey),
              hexToBytes(secret || ''),
            );
            const dec = new TextDecoder();
            decryptedPrivateKey = dec.decode(encodedPrivateKey);
            break;
          }
          default: {
            throw new Error(`Encryption type ${encryptionType} not supported`);
          }
        }

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
