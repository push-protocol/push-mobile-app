import React from 'react';
import {
  AsyncStorage,
  Platform
} from 'react-native';

import * as Keychain from 'react-native-keychain';

import GLOBALS from 'src/Globals';

// STATIC SINGLETON
export default class MetaStorage {
  static instance = MetaStorage.instance || new MetaStorage();

  // VARIBALES
  state = {}

  // INITIALIZE
  initialize = async () => {
    // For Initialization of anything, not needed right now
  }

  // WIPE SIGNED IN USER | LOCK DOWN RESET
  wipeSignedInUser = async () => {
    // Set user locked to true
    await this.setUserLocked(true);

    // Call Remove User Process
    await MetaStorage.instance.removeDataOfUser();
  }

  // RESET LOCKED OR SIGNED OUT USER | GRACEFUL RESET
  resetSignedInUser = async () => {
    // Set user locked to false, useful if user is locked
    await this.setUserLocked(false);

    // Set Signed Status as false also
    await this.setIsSignedIn(false);

    // Call Remove User Process
    await MetaStorage.instance.removeDataOfUser();

    // Set Passcode Attempts to MAX
    await this.setRemainingPasscodeAttempts(GLOBALS.CONSTANTS.MAX_PASSCODE_ATTEMPTS);
  }

  // REMOVE SIGNED IN USER
  removeDataOfUser = async () => {
    // Destroy Keychain
    await Keychain.resetGenericPassword();

    // Set Hashed Passcode and Encrypted PKey
    await this.setEncryptedPKeyAndHashedPasscode('', '');

    // Set Wallet Info Object As Null
    await this.setStoredWallet({
      ensRefreshTime: 0, // Time in epoch
      ens: '',
      wallet: '',
    });

    // Reset Push Notifications
    await this.setPushTokenResetFlag(true);
    await this.setPushTokenSentToServerFlag(false);
    await this.setPushToken('');
    await this.setCurrentAndPreviousBadgeCount(0, 0);
  }

  // GETTERS AND SETTERS STORAGE
  // PUSH TOKEN
  getPushToken = async () => {
    try {
      let token = await AsyncStorage.getItem(GLOBALS.STORAGE.PUSH_TOKEN);

      // Set Default Value
      if (token == null) {
        token = '';
      }

      return token;
    } catch (error) {
      console.warn(error);
      return false;
    }
  }

  setPushToken = async (newToken) => {
    try {
      let token = newToken;
      if (newToken == null) {
        token = false;
      }

      await AsyncStorage.setItem(
        GLOBALS.STORAGE.PUSH_TOKEN,
        JSON.stringify(token)
      );

    } catch (error) {
      // Error saving data
      console.warn(error);
      return false;
    }
  }

  // PUSH TOKEN SENT TO SERVER FLAG
  getPushTokenSentToServerFlag = async () => {
    try {
      let flag = await AsyncStorage.getItem(GLOBALS.STORAGE.PUSH_TOKEN_SENT_TO_SERVER_FLAG);

      // Set Default Value
      if (flag == null) {
        flag = false;

        await this.setPushTokenSentToServerFlag(flag);
        flag = JSON.stringify(flag);
      }

      return JSON.parse(flag);
    } catch (error) {
      console.warn(error);
      return false;
    }
  }

  setPushTokenSentToServerFlag = async (flag) => {
    try {
      let setting = flag;
      if (flag == null) {
        setting = false;
      }

      await AsyncStorage.setItem(
        GLOBALS.STORAGE.PUSH_TOKEN_SENT_TO_SERVER_FLAG,
        JSON.stringify(setting)
      );

    } catch (error) {
      // Error saving data
      console.warn(error);
      return false;
    }
  }

  // PUSH TOKEN RESET FLAG
  getPushTokenResetFlag = async () => {
    try {
      let resetFlag = await AsyncStorage.getItem(GLOBALS.STORAGE.PUSH_TOKEN_RESET_FLAG);

      // Set Default Value
      if (resetFlag == null) {
        resetFlag = false;

        await this.setPushTokenResetFlag(resetFlag);
        resetFlag = JSON.stringify(resetFlag);
      }

      return JSON.parse(resetFlag);
    } catch (error) {
      console.warn(error);
      return false;
    }
  }

  setPushTokenResetFlag = async (resetFlag) => {
    try {
      let setting = resetFlag;
      if (resetFlag == null) {
        setting = false;
      }

      await AsyncStorage.setItem(
        GLOBALS.STORAGE.PUSH_TOKEN_RESET_FLAG,
        JSON.stringify(setting)
      );

    } catch (error) {
      // Error saving data
      console.warn(error);
      return false;
    }
  }

  // STORE NOTIFICATION BADGE
  getBadgeCount = async () => {
    try {
      let badge = await AsyncStorage.getItem(GLOBALS.STORAGE.PUSH_BADGE_COUNT);
      if (badge == null) {
        badge = 0;
        badge = JSON.stringify(badge);
      }

      return JSON.parse(badge);
    } catch (error) {
      console.warn(error);
      return false;
    }
  }

  getPreviousBadgeCount = async () => {
    try {
      let badge = await AsyncStorage.getItem(GLOBALS.STORAGE.PUSH_BADGE_COUNT_PREVIOUS);
      if (badge == null) {
        badge = 0;
        badge = JSON.stringify(badge);
      }

      return JSON.parse(badge);
    } catch (error) {
      console.warn(error);
      return false;
    }
  }

  setBadgeCount = async (badge) => {
    try {
      let count = badge;
      if (count == null) {
        count = 0;
      }

      await AsyncStorage.setItem(
        GLOBALS.STORAGE.PUSH_BADGE_COUNT,
        JSON.stringify(count)
      );

    } catch (error) {
      // Error saving data
      console.warn(error);
      return false;
    }
  }

  setCurrentAndPreviousBadgeCount = async (currentBadge, previousBadge) => {
    // Swap if custom photo
    const items = [
      [GLOBALS.STORAGE.PUSH_BADGE_COUNT, JSON.stringify(currentBadge)],
      [GLOBALS.STORAGE.PUSH_BADGE_COUNT_PREVIOUS, JSON.stringify(previousBadge)]
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
  getStoredWallet = async () => {
    try {
      // Then Fetch Wallet
      let walletObj = await AsyncStorage.getItem(GLOBALS.STORAGE.STORED_WALLET_OBJ);

      // Set Default Value
      if (walletObj == null) {
        walletObj = {
          ensRefreshTime: 0, // Time in epoch
          ens: '',
          wallet: '',
        }

        await MetaStorage.instance.setStoredWallet(walletObj);
        walletObj = JSON.stringify(walletObj);
      }

      return JSON.parse(walletObj);
    } catch (error) {
      console.warn(error);
      return false;
    }
  }

  setStoredWallet = async (walletObject) => {
    try {
      await AsyncStorage.setItem(
        GLOBALS.STORAGE.STORED_WALLET_OBJ,
        JSON.stringify(walletObject)
      );
    } catch (error) {
      // Error saving data
      console.warn(error);
      return false;
    }
  }

  // GET NUMBER OF ATTEMPTS
  getRemainingPasscodeAttempts = async () => {
    try {
      let passcodeAttempts = await AsyncStorage.getItem(GLOBALS.STORAGE.PASSCODE_ATTEMPTS);

      // Set Default Value
      if (passcodeAttempts == null) {
        passcodeAttempts = GLOBALS.CONSTANTS.MAX_PASSCODE_ATTEMPTS;
        await this.setRemainingPasscodeAttempts(passcodeAttempts, true);
        passcodeAttempts = JSON.stringify(passcodeAttempts);
      }

      return JSON.parse(passcodeAttempts);
    } catch (error) {
      console.warn(error);
      return false;
    }
  }

  setRemainingPasscodeAttempts = async (attempts, settingDefault) => {
    try {
      let setting = attempts;
      if (attempts == null) {
        setting = 0;
      }

      await AsyncStorage.setItem(
        GLOBALS.STORAGE.PASSCODE_ATTEMPTS,
        JSON.stringify(attempts)
      );

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
        userLocked = JSON.stringify(userLocked);
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

      if (userLocked == false) {
        await this.setRemainingPasscodeAttempts(GLOBALS.CONSTANTS.MAX_PASSCODE_ATTEMPTS);
      }
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
        isSignedIn = JSON.stringify(isSignedIn);
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
