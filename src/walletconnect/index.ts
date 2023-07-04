import envConfig from 'src/env.config';

import './chat/createUser';

const WalletConnectConfig = {
  sessionParams: {
    namespaces: {
      eip155: {
        methods: ['personal_sign', 'eth_signTypedData'],
        chains: [envConfig.PROD_ENV ? 'eip155:1' : 'eip155:5'],
        events: ['chainChanged', 'accountsChanged'],
        rpcMap: {},
      },
    },
  },
  providerMetadata: (scheme: String) => ({
    name: 'Push Mobile App',
    description: 'Push Mobile App',
    url: 'https://push.org/',
    icons: ['https://avatars.githubusercontent.com/u/64157541?s=128'],
    redirect: {
      native: scheme,
    },
  }),
};

export {WalletConnectConfig};
export * from './channel/channelSub';
export {handleWalletConnectChatLogin} from './chat/loginUser';
