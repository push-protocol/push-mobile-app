import CryptoJS from "react-native-crypto-js";
import { sha256 } from 'react-native-sha256';

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
}

export default CryptoHelper;
