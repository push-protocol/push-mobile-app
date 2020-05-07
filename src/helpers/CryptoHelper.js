import CryptoJS from "react-native-crypto-js";
import { JSHash, CONSTANTS } from 'react-native-hash';

import crypto from 'crypto';
import EthCrypto from 'eth-crypto';
import {encrypt, decrypt} from 'eccrypto';
import { publicKeyConvert, publicKeyVerify } from 'secp256k1';

// Crypographic Helper Function
const CryptoHelper = {
  // To Encrypt with AES
  encryptWithAES: function (key, code) {
    return CryptoJS.AES.encrypt(key, code).toString();
  },
  // To Decrypt with AES
  decryptWithAES: function(key, code) {
    let bytes  = CryptoJS.AES.decrypt(key, code);
    return bytes.toString(CryptoJS.enc.Utf8);
  },
  // To Hash with SHA256
  hashWithSha256: async function(code) {
    const hashAlgorithm = CONSTANTS.HashAlgorithms.sha256;
    const hash = await JSHash(code, hashAlgorithm);

    return hash;
  },
  // To Verify SHA256 Match
  verifyHash: async function(code, existingHash) {
    const hashAlgorithm = CONSTANTS.HashAlgorithms.sha256;

    const hash = await JSHash(code, hashAlgorithm);

    if (hash === existingHash) {
      return true;
    }
    else {
      return false;
    }
  },
  // Testing of Encryption and Decryption
  encryptionDecryptionTest: async (privateKey) => {
    const startTime = new Date();
    console.log("[ENCRYPTION / DECRYPTION TEST STARTED] - " + startTime);

    const publicKey = EthCrypto.publicKeyByPrivateKey(privateKey);
    const compressedKey = EthCrypto.publicKey.compress(publicKey); // is String
    //console.log(compressedKey);

    const bytesCompKey = Uint8Array.from(compressedKey);
    //console.log(bytesCompKey);

    const msgToEncryp = "PartialStringAS";
    const msg = await CryptoHelper.encryptWithPublicKey(compressedKey, msgToEncryp);
     console.log("Encryped Message:" + msg);

    const encryptionTime = new Date().getTime() - startTime.getTime();
    console.log("[ENCRYPTION / DECRYPTION ENCRYPTION DONE] - " + encryptionTime / 1000 + " secs");

    // Decrypt this message
    const decryptMsg = await CryptoHelper.decryptWithPrivateKey(privateKey, msg);
    console.log("[ENCRYPTION / DECRYPTION DECRYPTED MESSAGE] - '" + decryptMsg + "'");

    const decryptionTime = new Date().getTime() - startTime.getTime() - encryptionTime;
    console.log("[ENCRYPTION / DECRYPTION DECRYPTION DONE] - " + decryptionTime / 1000 + " secs");
  },
  // Encryption with public key
  encryptWithPublicKey: async (publicKey, message) => {
    // Convert compressed public key, starts with 03 or 04
    const pubKeyUint8Array = Uint8Array.from(
      new Buffer(publicKey, 'hex')
    );
    //console.log("[ENCRYPTION] Public Key Uint8Array: " + pubKeyUint8Array);

    const convertedKeyAsUint8Array = publicKeyConvert(pubKeyUint8Array, false);
    //console.log("[ENCRYPTION] Public Key Converted: " + convertedKeyAsUint8Array);

    const convertedPublicKeyHex = new Buffer(convertedKeyAsUint8Array);
    //console.log("[ENCRYPTION] Converted Public Key Buffer: " + convertedPublicKeyHex);

    const pubKey = new Buffer(convertedPublicKeyHex, 'hex');
    //console.log("[ENCRYPTION] pubkey getting sentout for encrypt: " + pubKey);

    return encrypt(
        pubKey,
        Buffer(message)
    ).then(encryptedBuffers => {
      const cipher = {
          iv: encryptedBuffers.iv.toString('hex'),
          ephemPublicKey: encryptedBuffers.ephemPublicKey.toString('hex'),
          ciphertext: encryptedBuffers.ciphertext.toString('hex'),
          mac: encryptedBuffers.mac.toString('hex')
      };
      // use compressed key because it's smaller
      // const compressedKey = new Buffer.from(publicKeyConvert(Web3Helper.getUint8ArrayFromHexStr(cipher.ephemPublicKey), true)).toString('hex')
      const input = Uint8Array.from(
        new Buffer(cipher.ephemPublicKey, 'hex')
      );
      const keyConvert = publicKeyConvert(input, true)
      // console.log("[ENCRYPTION] Coverted key: " + keyConvert);

      const keyConvertBuffer = new Buffer(keyConvert);
      // console.log("[ENCRYPTION] Coverted key in buffer : " + keyConvertBuffer);
      // console.log(keyConvertBuffer);

      //console.log(keyConvert);
      const compressedKey = keyConvertBuffer.toString('hex')
      // console.log("[ENCRYPTION] Compressed key in buffer : ");
      // console.log(compressedKey);

      const ret = Buffer.concat([
        new Buffer(cipher.iv, 'hex'), // 16bit
        new Buffer(compressedKey, 'hex'), // 33bit
        new Buffer(cipher.mac, 'hex'), // 32bit
        new Buffer(cipher.ciphertext, 'hex') // var bit
      ]).toString('hex')

      return ret
    });
  },
  // Decryption with public key
  decryptWithPrivateKey: async (privateKey, encrypted) => {
    const buf = new Buffer(encrypted, 'hex');
    // console.log("[DECRYPTION] Buffer Passed: " + buf);

    encrypted = {
      iv: buf.toString('hex', 0, 16),
      ephemPublicKey: buf.toString('hex', 16, 49),
      mac: buf.toString('hex', 49, 81),
      ciphertext: buf.toString('hex', 81, buf.length)
    };
    // decompress publicKey
    // encrypted.ephemPublicKey = new Buffer.from(publicKeyConvert(Web3Helper.getUint8ArrayFromHexStr(encrypted.ephemPublicKey), true)).toString('hex')
    const input = Uint8Array.from(new Buffer(encrypted.ephemPublicKey, 'hex'));
    const keyConvert = publicKeyConvert(input, false)
    // console.log("[DECRYPTION] Coverted key: " + keyConvert);

    const keyConvertBuffer = new Buffer(keyConvert);
    // console.log("[DECRYPTION] Coverted key in buffer : " + keyConvertBuffer);
    // console.log(keyConvertBuffer);

    //console.log(keyConvert);
    const uncompressedKey = keyConvertBuffer.toString('hex')
    // console.log("[DECRYPTION] Uncompressed key in buffer : ");
    // console.log(uncompressedKey);

    encrypted.ephemPublicKey = uncompressedKey;
    const twoStripped = privateKey.substring(2)

    const encryptedBuffer = {
      iv: new Buffer(encrypted.iv, 'hex'),
      ephemPublicKey: new Buffer(encrypted.ephemPublicKey, 'hex'),
      ciphertext: new Buffer(encrypted.ciphertext, 'hex'),
      mac: new Buffer(encrypted.mac, 'hex')
    };

    return decrypt(
      new Buffer(twoStripped, 'hex'),
      encryptedBuffer
    ).then(decryptedBuffer => decryptedBuffer.toString());
  },
}

export default CryptoHelper;
