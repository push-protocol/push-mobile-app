import {getSignature} from '@pushprotocol/restapi/src/lib/chat/helpers';
import {getWallet} from '@pushprotocol/restapi/src/lib/chat/helpers/wallet';
import Constants from '@pushprotocol/restapi/src/lib/constants';
import {
  generateHash,
  preparePGPPublicKey,
} from '@pushprotocol/restapi/src/lib/helpers/crypto';
import {encryptedPrivateKeyType} from '@pushprotocol/restapi/src/lib/types';
import WalletConnect from '@walletconnect/client';
import axios from 'axios';
import GLOBALS from 'src/Globals';
import {generateKeyPair} from 'src/helpers/w2w/pgp';

import {encryptV2} from './aes';
import {
  bytesToHex,
  getRandomValues,
  getSigner,
  hexToBytes,
  walletToPCAIP10,
} from './utils';

const BASE_URL = GLOBALS.LINKS.W2W_EPNS_SERVER;
export const createUser = async (
  connector: WalletConnect,
): Promise<[boolean, string]> => {
  const [signer, account] = await getSigner(connector);
  const keyPairs = await generateKeyPair();
  const wallet = getWallet({account, signer});
  const encryptionType = Constants.ENC_TYPE_V2;
  const address = account;

  const publicKey: string = await preparePGPPublicKey(
    encryptionType,
    keyPairs.publicKeyArmored,
    address,
    wallet,
  );

  const encryptedPrivateKey: encryptedPrivateKeyType =
    await getEncryptedPrivateKey(wallet, keyPairs.privateKeyArmored, address);

  const data = {
    caip10: walletToPCAIP10(address),
    did: walletToPCAIP10(address),
    publicKey,
    encryptedPrivateKey: JSON.stringify(encryptedPrivateKey),
    encryptionType,
    name: '',
    encryptedPassword: null,
    nftOwner: null,
  };

  const hash = generateHash(data);
  const signatureObj = await getSignature(address, wallet, hash);

  const reqBody = {
    ...data,
    ...signatureObj,
  };

  const success = await axios
    .post(`${BASE_URL}/v1/users/`, reqBody)
    .then(_ => true)
    .catch(_ => false);

  if (success) {
    return [true, keyPairs.privateKeyArmored];
  } else {
    return [false, ''];
  }
};

const getEncryptedPrivateKey = async (
  wallet: any,
  privateKey: string,
  address: string,
) => {
  const input = bytesToHex(await getRandomValues(new Uint8Array(32)));
  const enableProfileMessage = 'Enable Push Chat Profile \n' + input;
  const {verificationProof: secret} = await getSignature(
    address,
    wallet,
    enableProfileMessage,
  );

  const enc = new TextEncoder();
  const encodedPrivateKey = enc.encode(privateKey);

  const encryptedPrivateKey = await encryptV2(
    encodedPrivateKey,
    hexToBytes(secret || ''),
  );
  encryptedPrivateKey.preKey = input;

  return encryptedPrivateKey;
};
