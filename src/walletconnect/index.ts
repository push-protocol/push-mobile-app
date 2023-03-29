import * as PushAPI from '@pushprotocol/restapi';
import WalletConnect from '@walletconnect/client';

import {createUser} from './createUser';

const getTypeInformation = (action: string) => {
  if (action === 'Create_user') {
    return {
      Data: [{name: 'data', type: 'string'}],
    };
  }
  return '';
};

const handleWalletConnectLogin = async (connector: WalletConnect) => {
  const user = await PushAPI.user.get({
    account: 'eip155:0xFe6C8E9e25f7bcF374412c5C81B2578aC473C0F7',
    env: 'staging',
  });

  let msg = await createUser();
  console.log(msg);

  const typeInformation = getTypeInformation('Create_user');
  console.log('v2', typeInformation);

  const account = connector.accounts[0];
  const dataToSign = getSingData(account, msg);

  //   const res = connector.signPersonalMessage([account, 'wola']);
  //   console.log(res);

  try {
    const signedMessage = await connector.signTypedData(dataToSign);
    console.log('sig is', signedMessage);
  } catch (error) {
    console.log('got err', error);
  }

  // check if user uses chat for the first time
  if (!user || user.encryptedPrivateKey === '') {
  }

  // check chat info & act accordingly
  if (user.encryptionType === 'x25519-xsalsa20-poly1305') {
    console.log('old chat ');
    return false;
  } else if (user.encryptionType === 'aes256GcmHkdfSha256') {
    return true;
  } else {
    console.log('Invalid encryption');
    return false;
  }
};

export {handleWalletConnectLogin};

const getSingData = (account: string, data: string) => {
  return [
    `${account}`,
    JSON.stringify({
      types: {
        EIP712Domain: [
          {
            name: 'name',
            type: 'string',
          },
          {
            name: 'version',
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
        Data: [
          {
            name: 'data',
            type: 'string',
          },
        ],
      },
      primaryType: 'Data',
      domain: {
        name: 'Push Chat',
        version: '1',
        chainId: 1,
        verifyingContract: '0xD26A7BF7fa0f8F1f3f73B056c9A67565A6aFE63c',
      },
      message: {
        data: `${data}`,
      },
    }),
  ];
};
