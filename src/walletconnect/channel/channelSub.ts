import * as PushAPI from '@pushprotocol/restapi';
import {ENV} from '@pushprotocol/restapi/src/lib/constants';
import {IProvider} from '@walletconnect/modal-react-native';
import {ethers} from 'ethers';
import Globals from 'src/Globals';
import ENV_CONFIG from 'src/env.config';

import {getSigner} from '../chat/utils';

export const handleChannelSub = async (
  wcProvider: IProvider,
  action: number,
  channel: string,
) => {
  // Ask wallet to switch network if required
  try {
    // From WalletConnect connector get ethers signer
    const [signer, user] = await getSigner(wcProvider);
    const config = getSubConfig(signer, user, channel);

    signer._signTypedData = async (
      domain: any,
      types: any,
      value: any,
      //@ts-ignore
    ): Promise<string> => {
      const payload = getPayload(action, domain, types, value);
      const params = [user, payload];
      const signature = await signer.provider.send('eth_signTypedData', params);
      return signature;
    };

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

const getPayload = (action: any, domain: any, types: any, value: any) => {
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
    primaryType: action === 1 ? 'Subscribe' : 'Unsubscribe',
    domain: domain,
    message: value,
  });
};
