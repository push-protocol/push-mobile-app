import CryptoJS from "react-native-crypto-js";
import { sha256 } from 'react-native-sha256';

import Web3Helper from 'src/helpers/Web3Helper';
import MetaStorage from 'src/singletons/MetaStorage';

// Crypographic Helper Function
const CryptoHelper = {
  // To Encrypt with AES
  encrypWithAES: function (key, code) {
    return CryptoJS.AES.encrypt(key, code).toString();
  },
  // To Decrypt with AES
  decryptWithAES: function(key, code) {
    let bytes  = CryptoJS.AES.decrypt(key, code);
    return bytes.toString(CryptoJS.enc.Utf8);
  },
  // To Hash with SHA256
  hashWithSha256: async function(code) {
    return await sha256(code);
  },
  // To Verify SHA256 Match
  verifyHash: async function(code, existingHash) {
    const hash = await CryptoHelper.hashWithSha256(code);
    if (hash === existingHash) {
      return true;
    }
    else {
      return false;
    }
  },
  // To Return false or Decrypted Private Key from Encrypted Private Key, code and hashedcode
  returnDecryptedPKey: async function(encryptedPKey, code) {
    let response = {};
    response.success = false;

    try {
      // Get Stored Hash Code
      const hashedCode = await MetaStorage.instance.getHashedPasscode();

      // Verify Hash Code
      const result = CryptoHelper.verifyHash(code, hashedCode);
      if (result) {
        // Hash Verified, Decrypt PKey
        const pkey = CryptoHelper.decryptWithAES(encryptedPKey, code);

        // Now derive public address of this Private Key
        const walletObject = await Web3Helper.getWalletAddress(pkey);
        if (walletObject.success) {
          const storedWalletObject = await MetaStorage.instance.getStoredWallet();
          if (walletObject.wallet === storedWalletObject.wallet) {
            response.success = true;
            response.pkey = pkey;
          }
        }
      }
    }
    catch(e) {
      response.success = false;
      response.info = e
    }

    return response;
  }
}

export default CryptoHelper;
