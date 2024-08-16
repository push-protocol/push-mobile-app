import {IUser, PushAPI, user as pushuser} from '@pushprotocol/restapi';
import {ENV} from '@pushprotocol/restapi/src/lib/constants';
import {useWalletConnectModal} from '@walletconnect/modal-react-native';
import {ethers} from 'ethers';
import React, {createContext, useEffect, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import GLOBALS from 'src/Globals';
import AuthModalWrapper from 'src/components/misc/AuthModalWrapper';
import envConfig from 'src/env.config';
import {walletToCAIP10} from 'src/helpers/CAIPHelper';
import ServerHelper from 'src/helpers/ServerHelper';
import useAuth from 'src/hooks/auth/useAuth';
import useModalBlur from 'src/hooks/ui/useModalBlur';
import {clearStorage} from 'src/navigation/screens/chats/helpers/storage';
import {
  selectAuthState,
  selectAuthType,
  selectCurrentUser,
  selectIsGuest,
  selectUsers,
  setAuthType,
  setInitialSignin,
  setIsGuest,
} from 'src/redux/authSlice';
import MetaStorage from 'src/singletons/MetaStorage';
import {getSigner} from 'src/walletconnect/chat/utils';

type PushApiContextType = {
  userPushSDKInstance: PushAPI | null;
  userInfo: IUser | null;
  setUserPushSDKInstance: React.Dispatch<React.SetStateAction<PushAPI | null>>;
  refreshUserPushSDKInstance: () => Promise<void>;
  getReadWriteInstance: (overrideAccount?: string) => Promise<void>;
  getReadOnlyInstance: (overrideAccount?: string) => Promise<void>;
  isLoading: boolean;
  showUnlockProfileModal: () => void;
};

export const PushApiContext = createContext<PushApiContextType>({
  userPushSDKInstance: null,
  userInfo: null,
  setUserPushSDKInstance: () => {},
  refreshUserPushSDKInstance: () => Promise.resolve(),
  getReadWriteInstance: () => Promise.resolve(),
  getReadOnlyInstance: () => Promise.resolve(),
  isLoading: true,
  showUnlockProfileModal: () => {},
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
  const [userInfo, setUserInfo] = useState<IUser | null>(null);
  const [connectedUser] = useSelector(selectUsers);
  const {isConnected, provider, address, open} = useWalletConnectModal();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const authState = useSelector(selectAuthState);
  const authType = useSelector(selectAuthType);
  const users = useSelector(selectUsers);
  const currentUser = useSelector(selectCurrentUser);
  const isGuest = useSelector(selectIsGuest);
  const dispatch = useDispatch();
  const {login} = useAuth();

  const {
    ModalComponent: UnlockProfileModal,
    hideModal: hideUnlockProfileModal,
    showModal: showUnlockProfileModal,
  } = useModalBlur();

  const {
    ModalComponent: AddressMismatchModal,
    showModal: showAddressMismatchModal,
    hideModal: hideAddressMismatchModal,
    isModalOpen: isAddressMismatchModalOpen,
  } = useModalBlur();

  const getReadOnlyInstance = async (overrideAccount?: string) => {
    const userInstanceReadOnly = await PushAPI.initialize({
      account: walletToCAIP10(
        overrideAccount ? overrideAccount : connectedUser.wallet,
      ),
      env: envConfig.ENV as ENV,
    });
    setUserPushSDKInstance(userInstanceReadOnly);
  };

  const getReadWriteInstance = async (overrideAccount?: string) => {
    let signer: any;

    const isWalletConnect = isConnected && provider;

    const {pgpPrivateKey} = await MetaStorage.instance.getUserChatData();

    if (connectedUser.userPKey) {
      signer = new ethers.Wallet(connectedUser.userPKey);
    } else if (isWalletConnect) {
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

    const userInstance = await PushAPI.initialize(signer, {
      account: walletToCAIP10(
        overrideAccount ? overrideAccount : connectedUser.wallet,
      ),
      env: envConfig.ENV as ENV,
      decryptedPGPPrivateKey: pgpPrivateKey ?? null,
    });

    setUserPushSDKInstance(userInstance);

    const decryptedPgpPvtKey = userInstance?.decryptedPgpPvtKey;
    const encryptionPublicKey = userInstance?.pgpPublicKey;

    if (decryptedPgpPvtKey && encryptionPublicKey) {
      await MetaStorage.instance.setUserChatData({
        pgpPrivateKey: decryptedPgpPvtKey,
        encryptionPublicKey,
      });
    }
    if (!userInstance.readmode() && userInstance.errors.length === 0) {
      dispatch(setIsGuest(false));
    } else {
      dispatch(setIsGuest(true));
    }
  };

  const refreshUserPushSDKInstance = async () => {
    // If the user is not connected to a wallet, do not initialize the push SDK with signer
    if (
      authType === GLOBALS.AUTH_TYPE.PRIVATE_KEY ||
      (authState !== GLOBALS.AUTH_STATE.ONBOARDING &&
        authType === GLOBALS.AUTH_TYPE.WALLET_CONNECT)
    ) {
      if (!isGuest) await getReadWriteInstance();
    }
  };

  useEffect(() => {
    (async () => {
      // Initialize the push SDK instance in read-only mode to avoid empty state
      // when requesting for the user's signature
      if (!connectedUser?.wallet) return;
      setIsLoading(true);
      await getReadOnlyInstance();
      await refreshUserPushSDKInstance();
      setIsLoading(false);
    })();
  }, [connectedUser?.wallet]);

  useEffect(() => {
    (async () => {
      const userInfo = await pushuser.get({
        account: walletToCAIP10(connectedUser?.wallet),
        env: envConfig.ENV as ENV,
      });
      setUserInfo(userInfo);
    })();
  }, [connectedUser, connectedUser?.wallet]);

  useEffect(() => {
    if (users.length === 0 || !users[currentUser]) return;
    const walletAddress = users[currentUser].wallet;
    if (
      isConnected &&
      walletAddress !== '' &&
      address !== undefined &&
      address.toLowerCase() !== walletAddress.toLowerCase()
    ) {
      // If the user tries to unlock profile with different wallet
      if (!isAddressMismatchModalOpen) showAddressMismatchModal();
    } else {
      refreshUserPushSDKInstance();
    }
  }, [users, currentUser, isConnected, address]);

  return (
    <PushApiContext.Provider
      value={{
        userPushSDKInstance,
        setUserPushSDKInstance,
        refreshUserPushSDKInstance,
        getReadWriteInstance,
        getReadOnlyInstance,
        userInfo,
        isLoading,
        showUnlockProfileModal,
      }}>
      <AddressMismatchModal
        InnerComponent={AuthModalWrapper}
        InnerComponentProps={{
          lockIconColor: '#E25959',
          icon: 'warning',
          title: 'Address Mismatch',
          subtitle:
            'To unlock your profile, please use the same address you used to log in.',
          footerButtons: [
            {
              title: 'Try Again',
              bgColor: GLOBALS.COLORS.BLACK,
              fontColor: GLOBALS.COLORS.WHITE,
              onPress: async () => {
                hideAddressMismatchModal();
                await provider?.disconnect();
                await open();
              },
            },
            {
              title: 'Continue with New Address',
              bgColor: GLOBALS.COLORS.TRANSPARENT,
              fontColor: GLOBALS.COLORS.BLACK,
              borderColor: GLOBALS.COLORS.BLACK,
              onPress: async () => {
                await getReadOnlyInstance(address);
                await ServerHelper.dissaociateTokenFromServer(
                  users[currentUser].wallet,
                );
                await MetaStorage.instance.removeUserChatData();
                await clearStorage();
                const newUsers = [
                  {
                    wallet: address,
                    userPKey: '',
                    ensRefreshTime: new Date().getTime() / 1000, // Time in epoch
                    cns: '',
                    ens: '',
                    index: 0,
                  },
                ];
                dispatch(setInitialSignin(newUsers[0]));
                dispatch(setAuthType(GLOBALS.AUTH_TYPE.WALLET_CONNECT));
                dispatch(setIsGuest(undefined));
                hideAddressMismatchModal();
                await login(newUsers);
                await getReadWriteInstance(address);
              },
            },
            {
              title: 'Cancel',
              bgColor: GLOBALS.COLORS.TRANSPARENT,
              fontColor: GLOBALS.COLORS.BLACK,
              onPress: async () => {
                hideAddressMismatchModal();
                await provider?.disconnect();
              },
            },
          ],
        }}
      />
      <UnlockProfileModal
        InnerComponent={AuthModalWrapper}
        InnerComponentProps={{
          lockIconColor: '#CF59E2',
          icon: 'copy',
          title: 'Unlock Your Profile',
          subtitle:
            'You are currently in read-only mode and need to unlock your profile to perform this action. Please sign using your wallet to continue.',
          footerButtons: [
            {
              title: 'Unlock Profile',
              bgColor: GLOBALS.COLORS.BLACK,
              fontColor: GLOBALS.COLORS.WHITE,
              onPress: async () => {
                hideUnlockProfileModal();
                if (isConnected) await getReadWriteInstance();
                else await open();
              },
            },
            {
              title: 'Not now',
              bgColor: GLOBALS.COLORS.TRANSPARENT,
              fontColor: GLOBALS.COLORS.BLACK,
              onPress: () => hideUnlockProfileModal(),
            },
          ],
        }}
      />
      {children}
    </PushApiContext.Provider>
  );
};

export default PushApiContextProvider;
