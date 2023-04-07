import * as PushAPI from '@pushprotocol/restapi';
import {ENV} from '@pushprotocol/restapi/src/lib/constants';
import WalletConnect from '@walletconnect/client';
import {ethers} from 'ethers';
import Globals from 'src/Globals';
import ENV_CONFIG from 'src/env.config';

import {getSigner} from '../chat/utils';

export const handleChannelSub = async (
  connector: WalletConnect,
  action: number,
  channel: string,
) => {
  // Ask wallet to switch network if required
  try {
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
      return true;
    } else if (action === 2) {
      await PushAPI.channels.unsubscribe(config);
      return true;
    }
  } catch (error) {
    console.log(error);
    return false;
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
