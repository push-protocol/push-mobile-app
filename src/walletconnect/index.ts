import WalletConnect from '@walletconnect/client';

import './chat/createUser';

export * from './channel/channelSub';
export {handleWalletConnectChatLogin} from './chat/loginUser';
export const isWalletConnectEnabled = (connector: WalletConnect) =>
  connector.connected;
