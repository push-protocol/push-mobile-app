import ENS from 'ethereum-ens';
import { ethers } from 'ethers';
import ENV_CONFIG from 'src/env.config';
import MetaStorage from 'src/singletons/MetaStorage';
import Web3 from 'web3';

const {default: Resolution} = require('@unstoppabledomains/resolution');

// Web3 Helper Function
const Web3Helper = {
  // To get checksum
  getAddressChecksum: function (address) {
    return ethers.utils.getAddress(address);
  },
  // To Get the Provider
  getWeb3Provider: function () {
    return new Web3.providers.HttpProvider(ENV_CONFIG.INFURA_API);
  },
  // To Get Web3
  getWeb3: function (provider) {
    if (!provider) {
      provider = Web3Helper.getWeb3Provider();
    }

    return new Web3(provider);
  },
  // To Get Ethers Provider
  getEthersProvider: function () {
    return new ethers.providers.Web3Provider(ENV_CONFIG.INFURA_API);
  },
  // To Get Ethers
  getEthersSigner: function (address, provider) {
    if (!provider) {
      provider = Web3Helper.getEthersProvider();
    }

    return new ethers.VoidSigner(address, provider);
  },
  // To Get ENS
  getENS: function (provider) {
    return new ENS(provider);
  },
  // To verify a given wallet
  getWalletVerification: async function (wallet) {
    utils.getAddress(address);
  },
  // To get Wallet Address from Private Key
  getWalletAddress: async function (pkey, provider, web3) {
    if (!provider) {
      provider = await Web3Helper.getWeb3Provider();
    }

    if (!web3) {
      web3 = await Web3Helper.getWeb3(provider);
    }

    try {
      const pkToAcc = await web3.eth.accounts.privateKeyToAccount(pkey);
      const response = {
        success: true,
        wallet: pkToAcc.address,
      };

      return response;
    } catch (e) {
      const response = {
        success: false,
        info: e,
      };

      return response;
    }
  },
  // To get ENS Rever Domain from Wallet
  getENSReverseDomain: async function (wallet, provider) {
    if (!provider) {
      provider = Web3Helper.getWeb3Provider();
    }

    try {
      const ens = Web3Helper.getENS(provider);
      const name = await ens.reverse(wallet).name();

      // console.log("Fetched Name... Forward Checking now: " + name);

      if (wallet != (await ens.resolver(name).addr())) {
        name = null;
        throw "Name Didn't Match";
      } else {
        const response = {
          success: true,
          ens: name,
        };

        return response;
      }
    } catch (e) {
      const response = {
        success: false,
        info: e,
      };

      return response;
    }
  },
  // Update ENS Record
  updateENSAndFetchWalletInfoObject: async () => {
    // Get Wallet Info for MetaStorage
    let storedWalletObject = await MetaStorage.instance.getStoredWallet();

    // Check for Time Stamp, if more than 24 hours than refresh ens records
    const currentTime = new Date().getTime() / 1000;
    const storedTime =
      storedWalletObject.ensRefreshTime == null
        ? 0
        : storedWalletObject.ensRefreshTime;

    if (
      storedWalletObject.wallet != null &&
      currentTime - storedWalletObject.ensRefreshTime > 1
    ) {
      const response = await Web3Helper.getENSReverseDomain(
        storedWalletObject.wallet,
      );

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
  // To get CNS Reverse Domain from Wallet
  getCNSReverseDomain: async function (wallet) {
    // example --> https://unstoppabledomains.com/api/v1/resellers/xxxx/domains?owner=0x033dc48B5dB4CA62861643e9D2C411D9eb6D1975&extension=crypto
    const endpoint = ENV_CONFIG.CNS_ENDPOINT;

    // prepare api url
    const apiURL = endpoint + '?owner=' + wallet + '&extension=crypto';

    return await fetch(apiURL, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    })
      .then(response => response.json())
      .then(responseJson => {
        let response = {
          success: false,
          cns: '',
        };

        if (responseJson['domains']?.length > 0) {
          response.success = true;

          let cns = '';
          responseJson['domains']?.map((item, i) => {
            cns = cns + item['name'];

            if (i != responseJson['domains']?.length - 1) {
              cns = cns + ' | ';
            }
          });

          if (responseJson['domains']?.length > 1) {
            cns = `${cns}`;
          }

          response.cns = cns;
        }

        return response;
      })
      .catch(error => {
        console.warn(error);
        return error;
      });
  },
  // Update CNS Record
  updateCNSAndFetchWalletInfoObject: async () => {
    // Get Wallet Info for MetaStorage
    let storedWalletObject = await MetaStorage.instance.getStoredWallet();

    // Check for Time Stamp, if more than 24 hours than refresh ens records
    const currentTime = new Date().getTime() / 1000;
    const storedTime =
      storedWalletObject.cnsRefreshTime == null
        ? 0
        : storedWalletObject.cnsRefreshTime;

    if (
      storedWalletObject.wallet != null &&
      (currentTime - storedWalletObject.cnsRefreshTime > 1 ||
        !storedWalletObject.cnsRefreshTime)
    ) {
      const response = await Web3Helper.getCNSReverseDomain(
        storedWalletObject.wallet,
      );

      let cns = '';
      let timestamp = currentTime;

      if (response.success) {
        // Update Time and exit
        cns = response.cns;
        updated = true;
      }

      storedWalletObject.cnsRefreshTime = currentTime;
      storedWalletObject.cns = cns;
    }

    // Set New Info on the Wallet
    await MetaStorage.instance.setStoredWallet(storedWalletObject);

    // Finally return Wallet Info
    return storedWalletObject;
  },
  // Check if the entry is non hex
  isHex: str => {
    if (str.length == 0) {
      return true;
    } else if (str.length == 1 && str.substring(0, 1) === '0') {
      return true;
    } else if (str.length == 2 && str.substring(0, 2) === '0x') {
      return true;
    } else {
      let modStr = str;
      if (str.substring(0, 2) === '0x') {
        modStr = str.substring(2);
      }
      modStr = modStr.toLowerCase();
      return /^[0-9a-f]+$/.test(modStr);
    }
  },
  // Resolve Domain name
  resolveBlockchainDomain: async (domain, currency) => {
    const resolution = new Resolution();
    return new Promise((resolve, reject) => {
      resolution
        .addr(domain, currency)
        .then(address => {
          console.log(address);
          resolve(address);
        })
        .catch(err => {
          console.log('got error');
          console.log(err);
          reject(err);
        });
    });
  },
};

export default Web3Helper;
