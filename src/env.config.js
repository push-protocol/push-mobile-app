import { Platform } from 'react-native';
import {
  TESTNET_INFURA_API,
  MAINNET_INFURA_API,

  DEV_EPNS_SERVER,
  PROD_EPNS_SERVER,

  ENDPOINT_AUTHTOKEN,
  ENDPOINT_REGISTER,
} from 'react-native-dotenv';

const IS_PROD_ENV = 1; // 1 is Production, 0 is testnet / development, 1 or socket server doesnt work
const SHOW_CONSOLE = 0; // Show or disable console

export default {
  PROD_ENV: IS_PROD_ENV,
  SHOW_CONSOLE: SHOW_CONSOLE,

  INFURA_API: IS_PROD_ENV ? MAINNET_INFURA_API : TESTNET_INFURA_API,

  // All Server related endpoints
  EPNS_SERVER: IS_PROD_ENV ? PROD_EPNS_SERVER : DEV_EPNS_SERVER,

  ENDPOINT_AUTHTOKEN: ENDPOINT_AUTHTOKEN,
  ENDPOINT_REGISTER: ENDPOINT_REGISTER,
};
