import envConfig from 'src/env.config';

const WalletConnectConfig = {
  sessionParams: {
    namespaces: {
      eip155: {
        methods: ['personal_sign', 'eth_signTypedData', 'eth_signTypedData_v4'],
        chains: [`eip155:${envConfig.CHAIN_ID}`],
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
  projectId: envConfig.WALLET_CONNECT_PROJECT_ID,
};

export {WalletConnectConfig};
export {handleWalletConnectChatLogin} from './chat/loginUser';
