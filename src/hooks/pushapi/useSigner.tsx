import {useWalletConnectModal} from '@walletconnect/modal-react-native';
import {ethers} from 'ethers';
import {useSelector} from 'react-redux';
import {selectUsers} from 'src/redux/authSlice';
import {getSigner} from 'src/walletconnect/chat/utils';

export const useSigner = () => {
  const [connectedUser] = useSelector(selectUsers);
  const {isConnected, provider} = useWalletConnectModal();

  const getPushSigner = async () => {
    let signer: any = undefined;
    if (connectedUser && connectedUser.userPKey) {
      signer = new ethers.Wallet(connectedUser.userPKey);
    } else if (isConnected && provider !== undefined) {
      const [sig, account] = await getSigner(provider);
      signer = sig;
      const getPayload = (domain: any, types: any, value: any) => {
        return JSON.stringify({
          types: {
            EIP712Domain: [
              {
                name: 'name',
                type: 'string',
              },
              {
                name: 'chainId',
                type: 'uint256',
              },
              {
                name: 'verifyingContract',
                type: 'address',
              },
            ],
            ...types,
          },
          primaryType: 'Data',
          domain: domain,
          message: value,
        });
      };
      signer._signTypedData = async (
        domain: any,
        types: any,
        value: any,
      ): Promise<string> => {
        const payload = getPayload(domain, types, value);
        const params = [account, payload];
        const signature = await signer?.provider?.send(
          'eth_signTypedData',
          params,
        );
        return signature;
      };
    }

    const account = await signer?.getAddress();

    return {signer, account};
  };

  return {getPushSigner};
};
