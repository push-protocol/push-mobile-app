import {useWalletConnectModal} from '@walletconnect/modal-react-native';
import {useMemo} from 'react';
import {useSelector} from 'react-redux';
import {usePushApi} from 'src/contexts/PushApiContext';
import {selectUsers} from 'src/redux/authSlice';

export const usePushApiMode = () => {
  const {userPushSDKInstance} = usePushApi();
  const [connectedUser] = useSelector(selectUsers);
  const {isConnected, provider} = useWalletConnectModal();

  const isGreenStatus = useMemo(() => {
    // If userPushSDKInstance is not available, not in enabled state
    if (!userPushSDKInstance) return false;
    const readMode = userPushSDKInstance.readmode();
    // If instance is in read mode, profile is not enabled
    if (readMode) return false;
    // Profile enabled and connected with private key
    if (connectedUser.userPKey) return true;
    // If profile is enabled, but user is not connected, not enabled
    return isConnected && provider !== undefined;
  }, [userPushSDKInstance, connectedUser.userPKey, isConnected, provider]);

  const isChatEnabled = useMemo(() => {
    // If userPushSDKInstance is not available, not in enabled state
    if (!userPushSDKInstance) return false;
    // Can decrypt messages if not in read mode
    return !userPushSDKInstance.readmode();
  }, [userPushSDKInstance]);

  const isSignerEnabled = useMemo(() => {
    // If connected with private key, signer is enabled
    if (connectedUser.userPKey) return true;
    // If connected with wallet and signer is available
    return isConnected && provider !== undefined;
  }, [connectedUser, isConnected, provider]);

  const isReadMode = useMemo(() => {
    if (!userPushSDKInstance) return true;
    return userPushSDKInstance.readmode();
  }, [userPushSDKInstance]);

  return {isGreenStatus, isChatEnabled, isSignerEnabled, isReadMode};
};
