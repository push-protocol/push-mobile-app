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
