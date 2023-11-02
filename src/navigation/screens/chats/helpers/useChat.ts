import {createUser} from '@kalashshah/react-native-sdk/src';
import {ENV} from '@pushprotocol/restapi/src/lib/constants';
import {useWalletConnectModal} from '@walletconnect/modal-react-native';
import {ethers} from 'ethers';
import {useSelector} from 'react-redux';
import envConfig from 'src/env.config';
import {selectCurrentUser, selectUsers} from 'src/redux/authSlice';
import {getSigner} from 'src/walletconnect/chat/utils';

const useChat = () => {
  const users = useSelector(selectUsers);
  const currentUser = useSelector(selectCurrentUser);
  const wc_connector = useWalletConnectModal();
  const {userPKey} = users[currentUser];

  const createNewPgpPair = async (caip10: string) => {
    let signer;
    if (wc_connector.isConnected && wc_connector.provider) {
      const [sig, account] = await getSigner(wc_connector.provider);
      signer = sig;
    } else if (userPKey) {
      signer = new ethers.Wallet(userPKey);
    }
    const createdUser = await createUser({
      account: caip10,
      env: envConfig.ENV as ENV,
      signer,
    });

    return createdUser;
  };

  return {createNewPgpPair};
};

export default useChat;
