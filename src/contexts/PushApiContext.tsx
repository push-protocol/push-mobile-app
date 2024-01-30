import {PushAPI} from '@pushprotocol/restapi';
import {ENV} from '@pushprotocol/restapi/src/lib/constants';
import {useWalletConnectModal} from '@walletconnect/modal-react-native';
import {ethers} from 'ethers';
import React, {createContext, useEffect, useState} from 'react';
import {useSelector} from 'react-redux';
import envConfig from 'src/env.config';
import {walletToCAIP10} from 'src/helpers/CAIPHelper';
import {selectUsers} from 'src/redux/authSlice';
import MetaStorage from 'src/singletons/MetaStorage';
import {getSigner} from 'src/walletconnect/chat/utils';

type PushApiContextType = {
  userPushSDKInstance: PushAPI | null;
  setUserPushSDKInstance: React.Dispatch<React.SetStateAction<PushAPI | null>>;
  refreshUserPushSDKInstance: () => Promise<void>;
  fakeSigner: boolean;
};

export const PushApiContext = createContext<PushApiContextType>({
  userPushSDKInstance: null,
  setUserPushSDKInstance: () => {},
  refreshUserPushSDKInstance: () => Promise.resolve(),
  fakeSigner: false,
});

export const usePushApi = () => {
  const context = React.useContext(PushApiContext);
  if (!context)
    throw new Error('usePushApi must be used within a PushApiContextProvider');

  return context;
};

const PushApiContextProvider = ({children}: {children: React.ReactNode}) => {
  const [userPushSDKInstance, setUserPushSDKInstance] =
    useState<PushAPI | null>(null);
  const [connectedUser] = useSelector(selectUsers);
  const {isConnected, provider} = useWalletConnectModal();
  const [fakeSigner, setFakeSigner] = useState<boolean>(false);

  const refreshUserPushSDKInstance = async () => {
    const {pgpPrivateKey} = await MetaStorage.instance.getUserChatData();
    // TODO: Remove fake signer later
    let signer: any = 'FAKE SIGNER';

    if (connectedUser.userPKey) {
      signer = new ethers.Wallet(connectedUser.userPKey);
    } else if (isConnected && provider) {
      // If the user has logged in via wallet connect
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
        const signature = await signer.provider.send(
          'eth_signTypedData',
          params,
        );
        return signature;
      };
    }

    setFakeSigner(signer === 'FAKE SIGNER');
    const userInstance = await PushAPI.initialize(signer, {
      account: walletToCAIP10(connectedUser.wallet),
      env: envConfig.ENV as ENV,
      // @ts-ignore
      decryptedPGPPrivateKey: pgpPrivateKey,
    });
    setUserPushSDKInstance(userInstance);
  };

  useEffect(() => {
    refreshUserPushSDKInstance();
  }, []);

  return (
    <PushApiContext.Provider
      value={{
        userPushSDKInstance,
        setUserPushSDKInstance,
        refreshUserPushSDKInstance,
        fakeSigner,
      }}>
      {children}
    </PushApiContext.Provider>
  );
};

export default PushApiContextProvider;
