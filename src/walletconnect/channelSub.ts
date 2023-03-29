import * as PushAPI from '@pushprotocol/restapi';
import {ENV} from '@pushprotocol/restapi/src/lib/constants';
import WalletConnect from '@walletconnect/client';
import WalletConnectProvider from '@walletconnect/web3-provider';
import {ethers} from 'ethers';
import Globals from 'src/Globals';
import ENV_CONFIG from 'src/env.config';

export const handleChannelSub = async (
  connector: WalletConnect,
  action: number,
  channel: string,
) => {
  // Ask wallet to switch network if required
  const chaindId = connector.chainId;
  if (chaindId !== ENV_CONFIG.CHAIN_ID) {
    await connector.sendCustomRequest({
      method: 'wallet_switchEthereumChain',
      params: [{chainId: `0x${ENV_CONFIG.CHAIN_ID}}`}],
    });
  }

  // From WalletConnect connector get ethers signer
  const [signer, user] = await getSigner(connector);
  const config = getSubConfig(signer, user, channel);

  // Handle the subscription action
  if (action === 1) {
    await PushAPI.channels.subscribe(config);
  } else if (action === 2) {
    await PushAPI.channels.unsubscribe(config);
  }
};

const getSubConfig = (
  signer: ethers.providers.JsonRpcSigner,
  user: string,
  channel: string,
) => {
  const config: PushAPI.channels.SubscribeOptionsType = {
    channelAddress: channel,
    signer,
    userAddress: user,
    env: ENV_CONFIG.ENV === 'prod' ? ENV.PROD : ENV.STAGING,
    verifyingContractAddress: Globals.CONTRACTS.COMM_CONTRACT,
  };

  return config;
};

const getSigner = async (
  connector: WalletConnect,
): Promise<[ethers.providers.JsonRpcSigner, string]> => {
  const provider = new WalletConnectProvider({
    connector,
    rpc: {
      [ENV_CONFIG.CHAIN_ID]: ENV_CONFIG.WC_RPC,
    },
    chainId: ENV_CONFIG.CHAIN_ID,
    qrcode: false,
  });
  await provider.enable();
  const ethers_provider = new ethers.providers.Web3Provider(provider);
  const signer = ethers_provider.getSigner();
  const account = await signer.getAddress();

  return [signer, account];
};
