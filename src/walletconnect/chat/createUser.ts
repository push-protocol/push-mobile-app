import {createUserService} from '@pushprotocol/restapi/src/lib/chat/helpers';
import {getWallet} from '@pushprotocol/restapi/src/lib/chat/helpers/wallet';
import Constants from '@pushprotocol/restapi/src/lib/constants';
import {
  encryptPGPKey,
  preparePGPPublicKey,
} from '@pushprotocol/restapi/src/lib/helpers/crypto';
import {encryptedPrivateKeyType} from '@pushprotocol/restapi/src/lib/types';
import {IProvider} from '@walletconnect/modal-react-native';
import envConfig from 'src/env.config';
import {generateKeyPair} from 'src/helpers/w2w/pgp';

import {getSigner, walletToPCAIP10} from './utils';

export const createUser = async (
  wcProvider: IProvider,
): Promise<[boolean, string, string]> => {
  const [signer, account] = await getSigner(wcProvider);

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
    wallet,
  );

  const caip10: string = walletToPCAIP10(address);
  const body: any = {
    user: caip10,
    wallet,
    publicKey: publicKey,
    encryptedPrivateKey: JSON.stringify(encryptedPrivateKey),
    env: envConfig.ENV,
  };

  await createUserService(body);

  return [true, keyPairs.privateKeyArmored, keyPairs.publicKeyArmored];
};
