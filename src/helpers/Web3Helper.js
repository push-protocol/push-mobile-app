import ENS from 'ethereum-ens';
import Web3 from 'web3';

import MetaStorage from 'src/singletons/MetaStorage';

import ENV_CONFIG from 'src/env.config';

// Web3 Helper Function
const Web3Helper = {
  // To Get the Provider
  getWeb3Provider: function () {
    return new Web3.providers.HttpProvider(ENV_CONFIG.INFURA_API);
  },
  // To Get Web3
  getWeb3: function(provider) {
    if (!provider) {
      provider = Web3Helper.getWeb3Provider();
    }

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
        success: true,
        wallet: pkToAcc.address
      }

      return response;
    }
    catch (e) {
      const response = {
        success: false,
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

      // console.log("Fetched Name... Forward Checking now: " + name);

      if (wallet != await ens.resolver(name).addr()) {
        name = null;
        throw "Name Didn't Match";
      }
      else {
        const response = {
          success: true,
          ens: name
        }

        return response;
      }
    }
    catch (e) {
      const response = {
        success: false,
        info: e
      }

      return response;
    }
  },
  // Update ENS Record
  updateENSAndFetchWalletInfoObject: async () => {
    // Get Wallet Info for MetaStorage
    let storedWalletObject = await MetaStorage.instance.getStoredWallet();

    // Check for Time Stamp, if more than 24 hours than refresh ens records
    const currentTime = new Date().getTime() / 1000;
    const storedTime = storedWalletObject.ensRefreshTime == null ? 0 : storedWalletObject.ensRefreshTime;

    if (storedWalletObject.wallet != null
        && currentTime - storedWalletObject.ensRefreshTime > 1
      ) {
      const response = await Web3Helper.getENSReverseDomain(storedWalletObject.wallet);

      let ens = '';
      let timestamp = currentTime;

      if (response.success) {
        // Update Time and exit
        ens = response.ens;
        updated = true;
      }

      storedWalletObject.ensRefreshTime = currentTime;
      storedWalletObject.ens = ens;
    }

    // Set New Info on the Wallet
    await MetaStorage.instance.setStoredWallet(storedWalletObject);

    // Finally return Wallet Info
    return storedWalletObject;
  },
}

export default Web3Helper;
