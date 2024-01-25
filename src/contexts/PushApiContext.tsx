import {PushAPI} from '@pushprotocol/restapi';
import {ENV} from '@pushprotocol/restapi/src/lib/constants';
import {ethers} from 'ethers';
import React, {createContext, useEffect, useState} from 'react';
import {useSelector} from 'react-redux';
import envConfig from 'src/env.config';
import {walletToCAIP10} from 'src/helpers/CAIPHelper';
import {selectUsers} from 'src/redux/authSlice';
import MetaStorage from 'src/singletons/MetaStorage';

type PushApiContextType = {
  userPushSDKInstance: PushAPI | null;
  setUserPushSDKInstance: React.Dispatch<React.SetStateAction<PushAPI | null>>;
  refreshUserPushSDKInstance: () => Promise<void>;
};

export const PushApiContext = createContext<PushApiContextType>({
  userPushSDKInstance: null,
  setUserPushSDKInstance: () => {},
  refreshUserPushSDKInstance: () => Promise.resolve(),
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

  const refreshUserPushSDKInstance = async () => {
    const {pgpPrivateKey} = await MetaStorage.instance.getUserChatData();
    let signer: any = 'FAKE SIGNER';

    if (!pgpPrivateKey && connectedUser.userPKey) {
      signer = new ethers.Wallet(connectedUser.userPKey);
    }

    // TODO: remove fake signer
    // @ts-ignore
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
      }}>
      {children}
    </PushApiContext.Provider>
  );
};

export default PushApiContextProvider;
