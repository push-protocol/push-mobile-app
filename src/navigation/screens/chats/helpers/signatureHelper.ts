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

  let signature: string = await pgpSign(hash, user.pgpPrivateKey);

  // Remove metadata from signature
  signature = signature.replace('Version: openpgp-mobile', '');
  return signature;
};
