import * as PushNodeClient from 'src/apis';
import {walletToCAIP10} from 'src/helpers/CAIPHelper';
import CryptoHelper from 'src/helpers/CryptoHelper';
import {pgpSign} from 'src/helpers/w2w/pgp';
import {UserChatCredentials} from 'src/navigation/screens/chats/ChatScreen';
import MetaStorage from 'src/singletons/MetaStorage';

export const pgpSignBody = async ({
  bodyToBeHashed,
}: {
  bodyToBeHashed: Object;
}) => {
  const hash = await CryptoHelper.hashWithSha256(
    JSON.stringify(bodyToBeHashed),
  );

  const user: UserChatCredentials =
    await MetaStorage.instance.getUserChatData();

  let userEncryptionPublicKey;
  try {
    userEncryptionPublicKey = JSON.parse(user.encryptionPublicKey).key;
  } catch (e) {
    const wallets = await MetaStorage.instance.getStoredWallet();
    if (!wallets.length) {
      throw new Error('No wallet found');
    }
    const {wallet} = wallets[0];
    const _user = await PushNodeClient.getUser(walletToCAIP10(wallet));
    const publicKey = _user?.publicKey;
    if (!publicKey) {
      throw new Error('No public key found');
    }
    userEncryptionPublicKey = JSON.parse(publicKey).key;
  }

  let signature: string = await pgpSign(
    hash,
    userEncryptionPublicKey,
    user.pgpPrivateKey,
  );

  // Remove metadata from signature
  signature = signature.replace('\nVersion: openpgp-mobile', '');
  return signature;
};
