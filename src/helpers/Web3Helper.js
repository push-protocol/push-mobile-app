import Web3 from 'web3';

// Web3 Helper Function
const Web3Helper = {
  // To get Wallet Address from Private Key
  getWalletAddress: async function(web3, pkey) {
    let response = {};

    try {
      const pkToAcc = await web3.eth.accounts.privateKeyToAccount(pkey);
      response = {
        wallet: pkToAcc.address
      }

      return response;
    }
    catch (e) {
      response = {
        error: true,
        info: e
      }

      return response;
    }
  },
}

export default Web3Helper;
