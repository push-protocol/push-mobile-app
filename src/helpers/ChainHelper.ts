import {ImageSourcePropType} from 'react-native';

type chainNameType =
  | 'ETH_TEST_SEPOLIA'
  | 'POLYGON_TEST_MUMBAI'
  | 'ETH_MAINNET'
  | 'POLYGON_MAINNET'
  | 'BSC_MAINNET'
  | 'BSC_TESTNET'
  | 'OPTIMISM_MAINNET'
  | 'OPTIMISM_TESTNET'
  | 'POLYGON_ZK_EVM_TESTNET'
  | 'POLYGON_ZK_EVM_MAINNET'
  | 'ARBITRUMONE_MAINNET'
  | 'ARBITRUM_TESTNET'
  | 'FUSE_MAINNET'
  | 'FUSE_TESTNET'
  | undefined;

export const ChainHelper = {
  chainIdToName: (chainId: number): chainNameType => {
    switch (chainId) {
      case 1:
        return 'ETH_MAINNET';
      case 11155111:
        return 'ETH_TEST_SEPOLIA';
      case 137:
        return 'POLYGON_MAINNET';
      case 80001:
        return 'POLYGON_TEST_MUMBAI';
      case 1442:
        return 'POLYGON_ZK_EVM_TESTNET';
      case 1101:
        return 'POLYGON_ZK_EVM_MAINNET';
      case 56:
        return 'BSC_MAINNET';
      case 97:
        return 'BSC_TESTNET';
      case 10:
        return 'OPTIMISM_MAINNET';
      case 69:
        return 'OPTIMISM_TESTNET';
      case 42161:
        return 'ARBITRUMONE_MAINNET';
      case 421614:
        return 'ARBITRUM_TESTNET';
      case 122:
        return 'FUSE_MAINNET';
      case 123:
        return 'FUSE_TESTNET';
      default:
        return undefined;
    }
  },

  chainNameToLogo: (name: chainNameType): ImageSourcePropType | null => {
    switch (name) {
      case 'ETH_MAINNET':
      case 'ETH_TEST_SEPOLIA':
        return require('assets/ui/ethereum.png');
      case 'POLYGON_MAINNET':
      case 'POLYGON_TEST_MUMBAI':
        return require('assets/ui/polygon.png');
      case 'POLYGON_ZK_EVM_TESTNET':
      case 'POLYGON_ZK_EVM_MAINNET':
        return require('assets/ui/polygonZkEVM.png');
      case 'BSC_MAINNET':
      case 'BSC_TESTNET':
        return require('assets/ui/bnb.png');
      case 'OPTIMISM_MAINNET':
      case 'OPTIMISM_TESTNET':
        return require('assets/ui/optimism.png');
      case 'ARBITRUMONE_MAINNET':
      case 'ARBITRUM_TESTNET':
        return require('assets/ui/arbitrum.png');
      case 'FUSE_MAINNET':
      case 'FUSE_TESTNET':
        return require('assets/ui/fuse.png');
      default:
        return null;
    }
  },

  chainIdToLogo: (chainId: number) => {
    const chainName = ChainHelper.chainIdToName(chainId);
    if (chainName) {
      return ChainHelper.chainNameToLogo(chainName);
    }
    return null;
  },
};
