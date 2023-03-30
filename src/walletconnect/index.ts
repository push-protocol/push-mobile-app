import * as PushAPI from '@pushprotocol/restapi';
import {
  getSignature,
  getWallet,
} from '@pushprotocol/restapi/src/lib/chat/helpers';
import Constants from '@pushprotocol/restapi/src/lib/constants';
import WalletConnect from '@walletconnect/client';
import * as PushNodeClient from 'src/apis';
import MetaStorage from 'src/singletons/MetaStorage';

import {decryptV2} from './aes';
import './createUser';
import {getSigner, hexToBytes, walletToPCAIP10} from './utils';

const handleWalletConnectLogin = async (connector: WalletConnect) => {
  const [signer, account] = await getSigner(connector);
  const caipAddrs = walletToPCAIP10(account);
  const wallet = getWallet({account, signer});
  const address = account;

  const user = (await PushNodeClient.getUser(caipAddrs)) as PushAPI.IUser;
  if (!user || !user.publicKey) {
    return false;
  }
  // Get the private key for the v2
  if (user.encryptionType === Constants.ENC_TYPE_V2) {
    console.log('new chat found');
    const {preKey: input} = JSON.parse(user.encryptedPrivateKey);
    const enableProfileMessage = 'Enable Push Chat Profile \n' + input;
    const {verificationProof: secret} = await getSignature(
      address,
      wallet,
      enableProfileMessage,
    );

    const encodedPrivateKey = await decryptV2(
      JSON.parse(user.encryptedPrivateKey),
      hexToBytes(secret || ''),
    );
    const dec = new TextDecoder();
    const decryptedPrivateKey = dec.decode(encodedPrivateKey);
    await MetaStorage.instance.setUserChatData({
      pgpPrivateKey: decryptedPrivateKey,
      encryptionPublicKey: '',
    });
    return true;
  }

  return false;
};

export {handleWalletConnectLogin};
export * from './channelSub';
export const isWalletConnectEnabled = (connector: WalletConnect) => {
  return connector.connected;
};
