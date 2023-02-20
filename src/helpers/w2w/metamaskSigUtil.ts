import * as metamaskSigUtil from '@metamask/eth-sig-util';

const encryptWithRPCEncryptionPublicKeyReturnRawData = (
  text: string,
  encryptionPublicKey: string,
) => {
  const encryptedSecret = metamaskSigUtil.encrypt({
    publicKey: encryptionPublicKey,
    data: text,
    version: 'x25519-xsalsa20-poly1305',
  });

  return encryptedSecret;
};

const decryptWithWalletRPCMethod = (
  encryptedData: metamaskSigUtil.EthEncryptedData,
  privateKey: string,
) => {
  return metamaskSigUtil.decrypt({encryptedData, privateKey});
};

export {
  encryptWithRPCEncryptionPublicKeyReturnRawData,
  decryptWithWalletRPCMethod,
};
