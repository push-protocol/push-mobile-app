import * as PushApi from '@pushprotocol/restapi';
import {ENV} from '@pushprotocol/restapi/src/lib/constants';
import {IProvider} from '@walletconnect/modal-react-native';
import envConfig from 'src/env.config';

import {getSigner, walletToPCAIP10} from './utils';

export const createUser = async (
  wcProvider: IProvider,
): Promise<[boolean, string, string]> => {
  const [signer, account] = await getSigner(wcProvider);

  const caip10: string = walletToPCAIP10(account);

  const user = await PushApi.user.create({
    account: caip10,
    env: envConfig.ENV as ENV,
    signer,
  });

  return [true, user.encryptedPrivateKey, user.publicKey];
};
