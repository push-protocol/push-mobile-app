import { Platform } from 'react-native';
import {
  TESTNET_INFURA_API,
  MAINNET_INFURA_API,
} from 'react-native-dotenv';

const IS_PROD_ENV = 0; // 1 is Production, 0 is testnet / development

export default {
  INFURA_API: IS_PROD_ENV ? MAINNET_INFURA_API : TESTNET_INFURA_API,

  // ANALYTICS_KEY: Platform.select({
  //   ios: IOS_ANALYTICS_KEY,
  //   android: ANDROID_ANALYTICS_KEY,
  // }),
};
