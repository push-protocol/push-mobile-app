import WalletConnect from '@walletconnect/client';

import './chat/createUser';

export {handleWalletConnectChatLogin} from './chat/loginUser';
export * from './channel/channelSub';
export const isWalletConnectEnabled = (connector: WalletConnect) => {
  return connector.connected;
};
