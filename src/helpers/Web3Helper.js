import ENS from 'ethereum-ens';
import Web3 from 'web3';

import CryptoHelper from 'src/helpers/CryptoHelper';
import MetaStorage from 'src/singletons/MetaStorage';

import ENV_CONFIG from 'root/env.config';

// Web3 Helper Function
const Web3Helper = {
  // To Get the Provider
  getWeb3Provider: function () {
    return new Web3.providers.HttpProvider(ENV_CONFIG.INFURA_API);
  },
  // To Get Web3
  getWeb3: function(provider) {
    return new Web3(provider);
  },
  // To Get ENS
  getENS: function(provider) {
    return new ENS(provider);
  },
  // To get Wallet Address from Private Key
  getWalletAddress: async function(pkey, provider, web3) {
    if (!provider) {
      provider = Web3Helper.getWeb3Provider();
    }

    if (!web3) {
      web3 = Web3Helper.getWeb3(provider);
    }

    try {
      const pkToAcc = await web3.eth.accounts.privateKeyToAccount(pkey);
      const response = {
        wallet: pkToAcc.address
      }

      return response;
    }
    catch (e) {
      const response = {
        error: true,
        info: e
      }

      return response;
    }
  },
  // To get ENS Rever Domain from Wallet
  getENSReverseDomain: async function(wallet, provider) {
    if (!provider) {
      provider = Web3Helper.getWeb3Provider();
    }

    try {
      const ens = Web3Helper.getENS(provider);
      const name = await ens.reverse(wallet).name();

      console.log("Fetched Name... Forward Checking now: " + name);

      if (wallet != await ens.resolver(name).addr()) {
        name = null;
        throw "Name Didn't Match";
      }
      else {
        const response = {
          ens: name
        }

        return response;
      }
    }
    catch (e) {
      const response = {
        error: true,
        info: e
      }

      return response;
    }
  },
  // To Return false or Decrypted Private Key from Encrypted Private Key, code and hashedcode
  returnDecryptedPKey: async function(encryptedPKey, code, hashedCode) {
    let response = false;

    // Verify Hash Code
    const result = CryptoHelper.verifyHash(code, hashedCode);
    if (result) {
      // Hash Verified, Decrypt PKey
      const pKey = decryptWithAES(encryptedPKey, code);

      // Now derive public address of this Private Key
      const wallet = await Web3Helper.getWalletAddress(pKey);
      const storedWallet = await MetaStorage.instance.getWalletInfo().wallet;

      // Return Private Key if Wallet Matches
      if (wallet === storedWallet) {
        response = pKey;
      }
    }

    return response;
  }

}

export default Web3Helper;
