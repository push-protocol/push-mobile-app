import {getEncryptionPublicKey} from '@metamask/eth-sig-util';
import {useEffect, useState} from 'react';
import * as PushNodeClient from 'src/apis';
import * as CaipHelper from 'src/helpers/CAIPHelper';
import CryptoHelper from 'src/helpers/CryptoHelper';
import {
  decryptWithWalletRPCMethod,
  encryptWithRPCEncryptionPublicKeyReturnRawData,
} from 'src/helpers/w2w/metamaskSigUtil';
import {generateKeyPair} from 'src/helpers/w2w/pgp';

// import MetaStorage from 'src/singletons/MetaStorage';

// TODO: migrate this to global
const CHAIN_ID = 42;

const useChatLoader = () => {
  const [isLoading, setIsLoading] = useState(true);
  // const [isError, setIsError] = useState(false);

  const createNewPgpPair = async (
    caip10: string,
    encryptionPublicKey: string,
  ) => {
    // Obtain pgp key
    const keyPairs = await generateKeyPair();

    const encryptedPgpKey = encryptWithRPCEncryptionPublicKeyReturnRawData(
      keyPairs.privateKeyArmored,
      encryptionPublicKey,
    );

    console.log('doing request');
    const createdUser = await PushNodeClient.createUser({
      caip10,
      did: caip10,
      publicKey: keyPairs.publicKeyArmored,
      encryptedPrivateKey: JSON.stringify(encryptedPgpKey),
      encryptionType: 'x25519-xsalsa20-poly1305',
      signature: 'xyz',
      sigType: 'a',
    });
    console.log('create new user', createdUser);
  };

  const checkUserProfile = async (
    caipAddress: string,
    encryptionPublicKey: string,
    privateKey: string,
  ) => {
    console.log('checking for user', caipAddress);
    const user = await PushNodeClient.getUser(caipAddress);

    // register if not reigistered
    if (!user) {
      console.log('Creating new user profile..........');
      await createNewPgpPair(caipAddress, encryptionPublicKey);
    }

    // load keys
    if (!user) {
      throw new Error('Key missing');
    }

    // decrypt was success
    const decryptedCipher = decryptWithWalletRPCMethod(
      JSON.parse(user.encryptedPrivateKey),
      privateKey,
    );
    console.log('decrypt was success');

    user.encryptedPrivateKey = JSON.parse(decryptedCipher)._result;
  };

  useEffect(() => {
    (async () => {
      // const {wallet} = await MetaStorage.instance.getStoredWallets()[0];
      const userPk =
        'c39d17b1575c8d5e6e615767e19dc285d1f803d21882fb0c60f7f5b7edb759b2';

      const ethPublicKey = CryptoHelper.getPublicKeyFromPrivateKey(userPk);

      const derivedAddress = CryptoHelper.getAddressFromPublicKey(ethPublicKey);
      console.log('derived address', derivedAddress);

      const caipAddress = CaipHelper.walletToCAIP10({
        account: derivedAddress,
        chainId: CHAIN_ID,
      });

      const encryptionPublicKey = getEncryptionPublicKey(userPk);

      await checkUserProfile(caipAddress, encryptionPublicKey, userPk);

      setIsLoading(false);
    })();
  }, []);

  return [isLoading];
};
export {useChatLoader};
