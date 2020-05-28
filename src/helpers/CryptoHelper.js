import CryptoJS from "crypto-js";
import { JSHash, CONSTANTS } from 'react-native-hash';

import EthCrypto from 'eth-crypto';
import {encrypt, decrypt} from 'eccrypto';
import { publicKeyConvert, publicKeyVerify } from 'secp256k1-v4';

// Crypographic Helper Function
const CryptoHelper = {
  // To Encrypt with AES
  encryptWithAES: function (message, key) {
    return CryptoJS.AES.encrypt(message, key).toString();
  },
  // To Decrypt with AES
  decryptWithAES: function(message, key) {
    let bytes  = CryptoJS.AES.decrypt(message, key);
    return bytes.toString(CryptoJS.enc.Utf8);
  },
  // To Hash with SHA256
  hashWithSha256: async function(message) {
    const hashAlgorithm = CONSTANTS.HashAlgorithms.sha256;
    const hash = await JSHash(message, hashAlgorithm);

    return hash;
  },
  // To Verify SHA256 Match
  verifyHash: async function(message, existingHash) {
    const hashAlgorithm = CONSTANTS.HashAlgorithms.sha256;

    const hash = await JSHash(message, hashAlgorithm);

    if (hash === existingHash) {
      return true;
    }
    else {
      return false;
    }
  },
  // To Form Encryted Secret, no more than 15 characters supported
  encryptWithECIES: async (message, privateKey) => {
    const publicKey = EthCrypto.publicKeyByPrivateKey(privateKey);
    const compressedKey = EthCrypto.publicKey.compress(publicKey);

    const encryptedSecret = await CryptoHelper.encryptWithPublicKey(message, compressedKey);

    // Not using it since sqlite2 has some error with this
    // const compressedEncryptedSecret = EthCrypto.hex.compress(encryptedSecret);

    return encryptedSecret;
  },
  // To Form Decrypted Secret, no more than 15 characters supported
  decryptWithECIES: async (message, privateKey) => {
    // Message is always compressed, not using because sqlite2 has some error with this
    //const uncompressedMessage = EthCrypto.hex.decompress(message).substr(2); // to remove 0x

    return await CryptoHelper.decryptWithPrivateKey(message, privateKey);
  },
  // Testing of Encryption and Decryption from Public to Private key
  encryptionDecryptionPublicToPrivateTest: async (privateKey) => {
    const startTime = new Date();
    console.log("[ENCRYPTION / DECRYPTION TEST STARTED] - " + startTime);

    const publicKey = EthCrypto.publicKeyByPrivateKey(privateKey);
    const compressedKey = EthCrypto.publicKey.compress(publicKey); // is String
    //console.log(compressedKey);

    // const bytesCompKey = Uint8Array.from(compressedKey);
    //console.log(bytesCompKey);

    const msgToEncrypt = "PartialStringAS";
    const msg = await CryptoHelper.encryptWithPublicKey(msgToEncrypt, compressedKey);
    console.log("Encryped Message With compressed public key:" + msg);

    const encryptionTime = new Date().getTime() - startTime.getTime();
    console.log("[ENCRYPTION / DECRYPTION ENCRYPTION DONE] - " + encryptionTime / 1000 + " secs");

    // Decrypt this message
    const decryptMsg = await CryptoHelper.decryptWithPrivateKey(msg, privateKey);
    console.log("[ENCRYPTION / DECRYPTION DECRYPTED MESSAGE] - '" + decryptMsg + "'");

    const decryptionTime = new Date().getTime() - startTime.getTime() - encryptionTime;
    console.log("[ENCRYPTION / DECRYPTION DECRYPTION DONE] - " + decryptionTime / 1000 + " secs");
  },
  // Encryption with public key
  encryptWithPublicKey: async (message, publicKey) => {
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
  decryptWithPrivateKey: async (message, privateKey) => {
    let encrypted = message;
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
  // To output messge payload if required
  outputMsgPayload: async (secret, subject, message, calltoaction, imageurl, pkey) => {
    // Output AES
    console.log("[AES ENCRYTED FORMAT (" + new Date() + ")");
    console.log("---------------------");
    console.log("secret --> ");
    const secretEncrypted = await CryptoHelper.encryptWithECIES(secret, pkey);
    const asubE = CryptoHelper.encryptWithAES(subject, secret);
    const amsgE = CryptoHelper.encryptWithAES(message, secret);
    const actaE = CryptoHelper.encryptWithAES(calltoaction, secret);
    const aimgE = CryptoHelper.encryptWithAES(imageurl, secret);

    console.log(secretEncrypted);
    console.log("asub --> ");
    console.log(asubE);
    console.log("amsg --> ");
    console.log(amsgE);
    console.log("acta --> ");
    console.log(actaE);
    console.log("aimg --> ");
    console.log(aimgE);
    console.log("decrypted secret --> ");
    console.log(await CryptoHelper.decryptWithECIES(secretEncrypted, pkey));
    console.log("decrypted asub --> ");
    console.log(CryptoHelper.decryptWithAES(asubE, secret));
    console.log("decrypted amsg --> ");
    console.log(CryptoHelper.decryptWithAES(amsgE, secret));
    console.log("decrypted acta --> ");
    console.log(CryptoHelper.decryptWithAES(actaE, secret));
    console.log("decrypted aimg --> ");
    console.log(CryptoHelper.decryptWithAES(aimgE, secret));
  },
  // To sign a message
  signMessage: (message, privateKey) => {
    const messageHash = EthCrypto.hash.keccak256(message);
    const signature = EthCrypto.sign(
        privateKey, // privateKey
        messageHash // hash of message
    );

    // compress it as well
    const compressedSign = EthCrypto.hex.compress(signature);
    return compressedSign;
  },
  // To recover wallet from sign message and message to check
  verifyAndRecoverWallet: (commpressedSign, messageToCheck) => {
    const uncompressSign = EthCrypto.hex.message(compressedSign);

    // message is always compressed, uncompress it
    const signer = EthCrypto.recover(
      uncompressSign, // uncompressed sign
      EthCrypto.hash.keccak256(messageToCheck) // signed message hash
    );
  },
  // Helpers
  // Get Public Key from Private Key
  getPublicKeyFromPrivateKey: (privateKey) => {
    return EthCrypto.publicKeyByPrivateKey(privateKey);
  },
  // To generate a random secret
  generateRandomSecret: (length) => {
     let result           = '';
     let characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
     let charactersLength = characters.length;
     for ( var i = 0; i < length; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
     }

     return result;
  }

}

export default CryptoHelper;
