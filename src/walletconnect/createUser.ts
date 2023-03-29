import {createUserService} from '@pushprotocol/restapi/src/lib/chat/helpers';
import {getWallet} from '@pushprotocol/restapi/src/lib/chat/helpers/wallet';
import Constants from '@pushprotocol/restapi/src/lib/constants';
import {preparePGPPublicKey} from '@pushprotocol/restapi/src/lib/helpers/crypto';
import {encryptedPrivateKeyType} from '@pushprotocol/restapi/src/lib/types';
import {ENV} from '@pushprotocol/socket/src/lib/constants';
import {ethers} from 'ethers';
import {generateKeyPair} from 'src/helpers/w2w/pgp';

import {encryptV2} from './aes';
import {
  bytesToHex,
  getRandomValues,
  getSignature,
  hexToBytes,
  walletToPCAIP10,
} from './utils';

export const createUser = async (
  signer: ethers.providers.JsonRpcSigner,
  account: string,
) => {
  const keyPairs = await generateKeyPair();
  const wallet = getWallet({account, signer});
  const encryptionType = Constants.ENC_TYPE_V2;
  const address = account;
  const caip10: string = walletToPCAIP10(address);

  const publicKey: string = await preparePGPPublicKey(
    encryptionType,
    keyPairs.publicKeyArmored,
    address,
    wallet,
  );

  const encryptedPrivateKey: encryptedPrivateKeyType =
    await getEncryptedPrivateKey(signer, keyPairs.privateKeyArmored, address);

  const body: any = {
    user: caip10,
    wallet,
    publicKey: publicKey,
    encryptedPrivateKey: JSON.stringify(encryptedPrivateKey),
    encryptionType: encryptionType,
    env: ENV.STAGING,
  };

  console.log(body);

  const res = await createUserService(body);
  console.log(res);

  // console.log('res', encryptedPrivateKey);
  // const pubKey = await prepareChatPublicKey(signer, keyPairs.publicKeyArmored);
  // const encPrivKey = await getEncryptedPrivateKey(
  //   signer,
  //   address,
  //   keyPairs.privateKeyArmored,
  // );
  // console.log('abishek we got', encPrivKey);
};

const getEncryptedPrivateKey = async (
  signer: ethers.providers.JsonRpcSigner,
  address: string,
  privateKey: string,
) => {
  const input = bytesToHex(await getRandomValues(new Uint8Array(32)));
  const enableProfileMessage = 'Enable Push Chat Profile \n' + input;
  const {verificationProof: secret} = await getSignature(
    address,
    signer,
    enableProfileMessage,
  );

  const enc = new TextEncoder();
  const encodedPrivateKey = enc.encode(privateKey);

  const encryptedPrivateKey = await encryptV2(
    encodedPrivateKey,
    hexToBytes(secret || ''),
  );

  return encryptedPrivateKey;
};
