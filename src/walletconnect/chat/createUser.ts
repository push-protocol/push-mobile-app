import {getEip712Signature} from '@pushprotocol/restapi/src/lib/chat/helpers';
import {getWallet} from '@pushprotocol/restapi/src/lib/chat/helpers/wallet';
import Constants from '@pushprotocol/restapi/src/lib/constants';
import {
  encryptPGPKey,
  generateHash,
  preparePGPPublicKey,
} from '@pushprotocol/restapi/src/lib/helpers/crypto';
import {encryptedPrivateKeyType} from '@pushprotocol/restapi/src/lib/types';
import WalletConnect from '@walletconnect/client';
import axios from 'axios';
import envConfig from 'src/env.config';
import {generateKeyPair} from 'src/helpers/w2w/pgp';

import {getSigner, walletToPCAIP10} from './utils';

const BASE_URL = envConfig.EPNS_SERVER;

export const createUser = async (
  connector: WalletConnect,
): Promise<[boolean, string]> => {
  const [signer, account] = await getSigner(connector);
  const keyPairs = await generateKeyPair();
  const wallet = getWallet({account, signer: signer as any});
  const encryptionType = Constants.ENC_TYPE_V3;
  const address = account;

  const publicKey: string = await preparePGPPublicKey(
    encryptionType,
    keyPairs.publicKeyArmored,
    wallet,
  );

  const encryptedPrivateKey: encryptedPrivateKeyType = await encryptPGPKey(
    encryptionType,
    keyPairs.privateKeyArmored,
    address,
    wallet,
  );

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
  const signatureObj = await getEip712Signature(wallet, hash, false);

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
