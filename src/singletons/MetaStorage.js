import React from 'react';
import {
  AsyncStorage,
  Platform
} from 'react-native';

import Web3Helper from 'src/helpers/Web3Helper';

import GLOBALS from 'src/Globals';

// STATIC SINGLETON
export default class MetaStorage {
  static instance = MetaStorage.instance || new MetaStorage();

  // VARIBALES
  state = {}

  // INITIALIZE
  initialize = async () => {
    // For Initialization of anything, not needed right now
    const encPkey = await MetaStorage.instance.getEncryptedPkey();
    const hashedPCode = await MetaStorage.instance.getHashedPasscode();

    console.log("Encrypted Private Key and Hash Code:");
    console.log(encPkey);
    console.log(hashedPCode);
  }

  // DECRYPT ENCRYPTED KEY
  getDecryptedPrivateKey = async () => {

  }

  // UPDATE ENS Record
  updateENSRecord = async (walletInfo) => {
    // Check for Time Stamp, if more than 24 hours than refresh ens records
    const currentTime = new Date().getTime() / 1000;
    const storedTime = walletInfo.ensRefreshTime == null ? 0 : walletInfo.ensRefreshTime;
    if (walletInfo.wallet != null
        && currentTime - walletInfo.ensRefreshTime > 1
      ) {
      const response = await Web3Helper.getENSReverseDomain();

      let ens = '';
      let timestamp = currentTime;

      if (!response.error) {
        // Update Time and exit
        ens = response.ens;
        updated = true;
      }

      walletInfo.ensRefreshTime = currentTime;
      walletInfo.ens = ens;
      await this.setWalletInfo(walletInfo);
    }

    return walletInfo;
  }

  // WIPE SIGNED IN USER
  wipeSignedInUser = async () => {
    await this.setUserLocked(true);
    await MetaStorage.instance.removeSignedInUser();
  }

  // RESET LOCKED OR SIGNED OUT USER
  resetSignedInUser = async () => {
    await this.setUserLocked(false);
    await MetaStorage.instance.removeSignedInUser();
  }

  // REMOVE SIGNED IN USER
  removeSignedInUser = async () => {
    await this.setWalletInfo(null);
    await this.resetSignedInStatus(false);
  }

  // GETTERS AND SETTERS STORAGE
  // FOR STORING ENCRYPTED PKEY AND HASHED PASSCODE
  getEncryptedPkey = async () => {
    try {
      const encryptedPKey = await AsyncStorage.getItem(GLOBALS.STORAGE.ENCRYPTED_PKEY);
      return encryptedPKey;
    } catch (error) {
      console.warn(error);
      return false;
    }
  }

  getHashedPasscode = async () => {
    try {
      const hashedPasscode = await AsyncStorage.getItem(GLOBALS.STORAGE.HASHED_PASSCODE);
      return hashedPasscode;
    } catch (error) {
      console.warn(error);
      return false;
    }
  }

  setEncryptedPKeyAndHashedPasscode = async (encryptedPKey, hashedPasscode) => {
      // Swap if custom photo
      const items = [
        [GLOBALS.STORAGE.ENCRYPTED_PKEY, encryptedPKey],
        [GLOBALS.STORAGE.HASHED_PASSCODE, hashedPasscode]
      ];

      try {
        return await AsyncStorage.multiSet(items, () => {
          // console.log("Encrypted Key and Hashed Passcode");
          // console.log(encryptedPKey + "|" + hashedPasscode);
        });
      }
      catch (error) {
        console.warn(error);
        return false;
      }
    }

  // FOR STORING USER WALLET, ENS AND TIMESTAMP
  getWalletInfo = async () => {
    try {
      // Then Fetch Wallet
      let walletInfo = await AsyncStorage.getItem(GLOBALS.STORAGE.GENERIC_WALLET_INFO);

      // Set Default Value
      if (walletInfo == null) {
        walletInfo = {
          ensRefreshTime: 0, // Time in epoch
          ens: '',
          wallet: '',
        }

        await MetaStorage.instance.setWalletInfo(walletInfo);
      }
      else {
        // Update ENS Record
        walletInfo = await MetaStorage.instance.updateENSRecord(walletInfo);
      }

      return JSON.parse(walletInfo);
    } catch (error) {
      console.warn(error);
      return false;
    }
  }

  setWalletInfo = async (walletObject) => {
    try {
      await AsyncStorage.setItem(
        GLOBALS.STORAGE.GENERIC_WALLET_INFO,
        JSON.stringify(walletObject)
      );
    } catch (error) {
      // Error saving data
      console.warn(error);
      return false;
    }
  }

  // GET NUMBER OF ATTEMPTS
  getPasscodeAttempts = async () => {
    try {
      let passcodeAttempts = await AsyncStorage.getItem(GLOBALS.STORAGE.PASSCODE_ATTEMPTS);

      // Set Default Value
      if (passcodeAttempts == null) {
        passcodeAttempts = 0;
        await this.setPasscodeAttempts(0);
      }

      return JSON.parse(passcodeAttempts);
    } catch (error) {
      console.warn(error);
      return false;
    }
  }

  setPasscodeAttempts = async (attempts) => {
    try {
      let setting = attempts;
      if (attempts == null) {
        setting = 0;
      }

      await AsyncStorage.setItem(
        GLOBALS.STORAGE.PASSCODE_ATTEMPTS,
        JSON.stringify(attempts)
      );

      if (attemps > GLOBALS.CONSTANTS.PASSCODE_ATTEMPTS) {
        // Wipe Account
        await MetaStorage.instance.wipeSignedInUser();
      }
    } catch (error) {
      // Error saving data
      console.warn(error);
      return false;
    }
  }

  // USER LOCKED
  getUserLocked = async () => {
    try {
      let userLocked = await AsyncStorage.getItem(GLOBALS.STORAGE.USER_LOCKED);

      // Set Default Value
      if (userLocked == null) {
        userLocked = false;
        await this.setUserLocked(userLocked);
      }

      return JSON.parse(userLocked);
    } catch (error) {
      console.warn(error);
      return false;
    }
  }

  setUserLocked = async (userLocked) => {
    try {
      let setting = userLocked;
      if (userLocked == null) {
        setting = false;
      }

      await AsyncStorage.setItem(
        GLOBALS.STORAGE.USER_LOCKED,
        JSON.stringify(setting)
      );
    } catch (error) {
      // Error saving data
      console.warn(error);
      return false;
    }
  }

  // IS USER SIGNED IN
  getIsSignedIn = async () => {
    try {
      let isSignedIn = await AsyncStorage.getItem(GLOBALS.STORAGE.IS_SIGNED_IN);

      // Set Default Value
      if (isSignedIn == null) {
        isSignedIn = false;
        await this.setIsSignedIn(isSignedIn);
      }

      return JSON.parse(isSignedIn);
    } catch (error) {
      console.warn(error);
      return false;
    }
  }

  setIsSignedIn = async (isSignedIn) => {
    try {
      let setting = isSignedIn;
      if (isSignedIn == null) {
        setting = false;
      }

      await AsyncStorage.setItem(
        GLOBALS.STORAGE.IS_SIGNED_IN,
        JSON.stringify(setting)
      );
    } catch (error) {
      // Error saving data
      console.warn(error);
      return false;
    }
  }

}
