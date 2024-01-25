import * as PushAPI from '@pushprotocol/restapi';
import {ENV} from '@pushprotocol/restapi/src/lib/constants';
import {IProvider} from '@walletconnect/modal-react-native';
import * as PushNodeClient from 'src/apis';
import envConfig from 'src/env.config';
import MetaStorage from 'src/singletons/MetaStorage';

import {createUser} from './createUser';
import {getSigner, walletToPCAIP10} from './utils';

export const handleWalletConnectChatLogin = async (wcProvider: IProvider) => {
  const [signer, account] = await getSigner(wcProvider);
  const caipAddrs = walletToPCAIP10(account);

  let user = (await PushNodeClient.getUser(caipAddrs)) as PushAPI.IUser;

  // user is new
  // create the pgp pair
  if (!user || !user.publicKey) {
    const [success, privKey, pubKey] = await createUser(wcProvider);
    if (success) {
      await MetaStorage.instance.setUserChatData({
        pgpPrivateKey: privKey,
        encryptionPublicKey: pubKey,
      });
      return true;
    } else {
      return false;
    }
  }

  try {
    const pgpKey = await PushAPI.chat.decryptPGPKey({
      encryptedPGPPrivateKey: user.encryptedPrivateKey,
      account: caipAddrs,
      env: envConfig.ENV as ENV,
      signer: signer,
    });

    await MetaStorage.instance.setUserChatData({
      pgpPrivateKey: pgpKey,
      encryptionPublicKey: user.publicKey,
    });

    return true;
  } catch (error) {
    console.log('Error while decrypting pgp key', error);
  }

  return false;
};
