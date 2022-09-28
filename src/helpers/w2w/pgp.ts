import {cipher} from 'eth-crypto';
import OpenPGP from 'react-native-fast-openpgp';

export const generateKeyPair = async (): Promise<{
  privateKeyArmored: string;
  publicKeyArmored: string;
}> => {
  console.log('called');
  const keys = await OpenPGP.generate({
    name: '',
    email: '',
    keyOptions: {
      rsaBits: 2048,
    },
  });

  return {
    privateKeyArmored: keys.privateKey,
    publicKeyArmored: keys.publicKey,
  };
};

export const pgpDecrypt = async (_cipher: string, privateKey: string) => {
  const output = await OpenPGP.decrypt(_cipher, privateKey, '');
  return output;
};
