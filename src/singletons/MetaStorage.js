import React from 'react'
import { Platform } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'

import GLOBALS from 'src/Globals'

// STATIC SINGLETON
export default class MetaStorage {
  static instance = MetaStorage.instance || new MetaStorage()

  // VARIBALES
  state = {}

  // INITIALIZE
  initialize = async () => {
    // For Initialization of anything, not needed right now
  }

  // GETTERS AND SETTERS STORAGE
  // PUSH TOKEN
  getPushToken = async () => {
    try {
      let token = await AsyncStorage.getItem(GLOBALS.STORAGE.PUSH_TOKEN)

      // Set Default Value
      if (token == null) {
        token = ''
      }

      return token
    } catch (error) {
      console.warn(error)
      return false
    }
  }

  setPushToken = async (newToken) => {
    try {
      let token = newToken
      if (newToken == null) {
        token = ''
      }

      await AsyncStorage.setItem(GLOBALS.STORAGE.PUSH_TOKEN, token)
    } catch (error) {
      // Error saving data
      console.warn(error)
      return false
    }
  }

  // PUSH TOKEN TO REMOVE IF ANY, TRIGGERS ON REFRESH TOKEN
  getPushTokenToRemove = async () => {
    try {
      let token = await AsyncStorage.getItem(
        GLOBALS.STORAGE.PUSH_TOKEN_TO_REMOVE,
      )

      // Set Default Value
      if (token == null) {
        token = ''
      }

      return token
    } catch (error) {
      console.warn(error)
      return false
    }
  }

  setPushTokenToRemove = async (token) => {
    try {
      if (token == null) {
        token = ''
      }

      await AsyncStorage.setItem(GLOBALS.STORAGE.PUSH_TOKEN_TO_REMOVE, token)
    } catch (error) {
      // Error saving data
      console.warn(error)
      return false
    }
  }

  // PUSH TOKEN SENT TO SERVER FLAG
  getPushTokenSentToServerFlag = async () => {
    try {
      let flag = await AsyncStorage.getItem(
        GLOBALS.STORAGE.PUSH_TOKEN_SERVER_SYNCED,
      )

      // Set Default Value
      if (flag == null) {
        flag = false

        await this.setTokenServerSynced(flag)
        flag = JSON.stringify(flag)
      }

      return JSON.parse(flag)
    } catch (error) {
      console.warn(error)
      return false
    }
  }

  setTokenServerSynced = async (flag) => {
    try {
      let setting = flag
      if (flag == null) {
        setting = false
      }

      await AsyncStorage.setItem(
        GLOBALS.STORAGE.PUSH_TOKEN_SERVER_SYNCED,
        JSON.stringify(setting),
      )
    } catch (error) {
      // Error saving data
      console.warn(error)
      return false
    }
  }

  // STORE NOTIFICATION BADGE
  getBadgeCount = async () => {
    try {
      let badge = await AsyncStorage.getItem(GLOBALS.STORAGE.PUSH_BADGE_COUNT)
      if (badge == null) {
        badge = 0
        badge = JSON.stringify(badge)
      }

      return JSON.parse(badge)
    } catch (error) {
      console.warn(error)
      return false
    }
  }

  getPreviousBadgeCount = async () => {
    try {
      let badge = await AsyncStorage.getItem(
        GLOBALS.STORAGE.PUSH_BADGE_COUNT_PREVIOUS,
      )
      if (badge == null) {
        badge = 0
        badge = JSON.stringify(badge)
      }

      return JSON.parse(badge)
    } catch (error) {
      console.warn(error)
      return false
    }
  }

  setBadgeCount = async (badge) => {
    try {
      let count = badge
      if (count == null) {
        count = 0
      }

      await AsyncStorage.setItem(
        GLOBALS.STORAGE.PUSH_BADGE_COUNT,
        JSON.stringify(count),
      )
    } catch (error) {
      // Error saving data
      console.warn(error)
      return false
    }
  }

  setCurrentAndPreviousBadgeCount = async (currentBadge, previousBadge) => {
    // Swap if custom photo
    const items = [
      [GLOBALS.STORAGE.PUSH_BADGE_COUNT, JSON.stringify(currentBadge)],
      [
        GLOBALS.STORAGE.PUSH_BADGE_COUNT_PREVIOUS,
        JSON.stringify(previousBadge),
      ],
    ]

    try {
      return await AsyncStorage.multiSet(items, () => {
        // console.log("Encrypted Key and Hashed Passcode");
        // console.log(encryptedPKey + "|" + hashedPasscode);
      })
    } catch (error) {
      console.warn(error)
      return false
    }
  }

  // FOR STORING ENCRYPTED PKEY AND HASHED PASSCODE
  getEncryptedPkey = async () => {
    try {
      const encryptedPKey = await AsyncStorage.getItem(
        GLOBALS.STORAGE.ENCRYPTED_PKEY,
      )
      return encryptedPKey
    } catch (error) {
      console.warn(error)
      return false
    }
  }

  getHashedPasscode = async () => {
    try {
      const hashedPasscode = await AsyncStorage.getItem(
        GLOBALS.STORAGE.HASHED_PASSCODE,
      )
      return hashedPasscode
    } catch (error) {
      console.warn(error)
      return false
    }
  }

  setEncryptedPKeyAndHashedPasscode = async (encryptedPKey, hashedPasscode) => {
    // Swap if custom photo
    const items = [
      [GLOBALS.STORAGE.ENCRYPTED_PKEY, encryptedPKey],
      [GLOBALS.STORAGE.HASHED_PASSCODE, hashedPasscode],
    ]

    try {
      return await AsyncStorage.multiSet(items, () => {
        // console.log("Encrypted Key and Hashed Passcode");
        // console.log(encryptedPKey + "|" + hashedPasscode);
      })
    } catch (error) {
      console.warn(error)
      return false
    }
  }

  // FOR STORING SIGNED IN TYPE
  getSignedInType = async () => {
    const isSignedIn = await this.getIsSignedIn()

    if (isSignedIn) {
      const privateKey = await this.getEncryptedPkey()

      if (!privateKey || privateKey === GLOBALS.CONSTANTS.NULL_EXCEPTION) {
        // sign in is via wallet
        return GLOBALS.CONSTANTS.CRED_TYPE_WALLET
      } else {
        return GLOBALS.CONSTANTS.CRED_TYPE_PRIVATE_KEY
      }
    } else {
      return false
    }
  }

  // FOR STORING USER WALLET, ENS AND TIMESTAMP
  getStoredWallet = async () => {
    try {
      // Then Fetch Wallet
      let walletObj = await AsyncStorage.getItem(
        GLOBALS.STORAGE.STORED_WALLET_OBJ,
      )

      // Set Default Value
      if (walletObj == null) {
        walletObj = {
          cnsRefreshTime: 0, // Time in epoch
          cns: '',
          ensRefreshTime: 0, // Time in epoch
          ens: '',
          wallet: '',
        }

        await MetaStorage.instance.setStoredWallet(walletObj)
        walletObj = JSON.stringify(walletObj)
      }

      return JSON.parse(walletObj)
    } catch (error) {
      console.warn(error)
      return false
    }
  }

  setStoredWallet = async (walletObject) => {
    try {
      await AsyncStorage.setItem(
        GLOBALS.STORAGE.STORED_WALLET_OBJ,
        JSON.stringify(walletObject),
      )
    } catch (error) {
      // Error saving data
      console.warn(error)
      return false
    }
  }

  // GET NUMBER OF ATTEMPTS
  getRemainingPasscodeAttempts = async () => {
    try {
      let passcodeAttempts = await AsyncStorage.getItem(
        GLOBALS.STORAGE.PASSCODE_ATTEMPTS,
      )

      // Set Default Value
      if (passcodeAttempts == null) {
        passcodeAttempts = GLOBALS.CONSTANTS.MAX_PASSCODE_ATTEMPTS
        await this.setRemainingPasscodeAttempts(passcodeAttempts, true)
        passcodeAttempts = JSON.stringify(passcodeAttempts)
      }

      return JSON.parse(passcodeAttempts)
    } catch (error) {
      console.warn(error)
      return false
    }
  }

  setRemainingPasscodeAttempts = async (attempts, settingDefault) => {
    try {
      let setting = attempts
      if (attempts == null) {
        setting = 0
      }

      await AsyncStorage.setItem(
        GLOBALS.STORAGE.PASSCODE_ATTEMPTS,
        JSON.stringify(attempts),
      )
    } catch (error) {
      // Error saving data
      console.warn(error)
      return false
    }
  }

  // USER LOCKED
  getUserLocked = async () => {
    try {
      let userLocked = await AsyncStorage.getItem(GLOBALS.STORAGE.USER_LOCKED)

      // Set Default Value
      if (userLocked == null) {
        userLocked = false
        await this.setUserLocked(userLocked)
        userLocked = JSON.stringify(userLocked)
      }

      return JSON.parse(userLocked)
    } catch (error) {
      console.warn(error)
      return false
    }
  }

  setUserLocked = async (userLocked) => {
    try {
      let setting = userLocked

      if (userLocked == null) {
        setting = false
      }

      await AsyncStorage.setItem(
        GLOBALS.STORAGE.USER_LOCKED,
        JSON.stringify(setting),
      )

      if (userLocked == false) {
        await this.setRemainingPasscodeAttempts(
          GLOBALS.CONSTANTS.MAX_PASSCODE_ATTEMPTS,
        )
      }
    } catch (error) {
      // Error saving data
      console.warn(error)
      return false
    }
  }

  // FIRST SIGN IN BY USER
  getFirstSignInByUser = async () => {
    try {
      let firstSignIn = await AsyncStorage.getItem(
        GLOBALS.STORAGE.FIRST_SIGN_IN,
      )

      // Set Default Value
      if (firstSignIn == null) {
        firstSignIn = true

        await this.setIsSignedIn(firstSignIn)
        firstSignIn = JSON.stringify(firstSignIn)
      }

      return JSON.parse(firstSignIn)
    } catch (error) {
      console.warn(error)
      return false
    }
  }

  setFirstSignInByUser = async (firstSignIn) => {
    try {
      let setting = firstSignIn
      if (firstSignIn == null) {
        setting = false
      }

      await AsyncStorage.setItem(
        GLOBALS.STORAGE.FIRST_SIGN_IN,
        JSON.stringify(setting),
      )
    } catch (error) {
      // Error saving data
      console.warn(error)
      return false
    }
  }

  // IS USER SIGNED IN
  getIsSignedIn = async () => {
    try {
      let isSignedIn = await AsyncStorage.getItem(GLOBALS.STORAGE.IS_SIGNED_IN)

      // Set Default Value
      if (isSignedIn == null) {
        isSignedIn = false

        await this.setIsSignedIn(isSignedIn)
        isSignedIn = JSON.stringify(isSignedIn)
      }

      return JSON.parse(isSignedIn)
    } catch (error) {
      console.warn(error)
      return false
    }
  }

  setIsSignedIn = async (isSignedIn) => {
    try {
      let setting = isSignedIn
      if (isSignedIn == null) {
        setting = false
      }

      await AsyncStorage.setItem(
        GLOBALS.STORAGE.IS_SIGNED_IN,
        JSON.stringify(setting),
      )
    } catch (error) {
      // Error saving data
      console.warn(error)
      return false
    }
  }

  clearStorage = async () => {
    const keys = await AsyncStorage.getAllKeys()
    await AsyncStorage.multiRemove(keys)
  }
}
