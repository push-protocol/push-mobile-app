import OpenPGP from 'react-native-fast-openpgp';

export const getConnectedUser = async ({}) => {};

export const sign = async ({
  message,
  publicKey,
  privateKey,
}: {
  message: string;
  publicKey: string;
  privateKey: string;
}) => {
  let signature: string = await OpenPGP.sign(
    message,
    publicKey,
    privateKey,
    '',
  );

  // Remove metadata from signature
  signature = signature.replace('\nVersion: openpgp-mobile', '');

  return signature;
};
