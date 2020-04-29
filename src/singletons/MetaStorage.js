import React from 'react';
import { AsyncStorage, Platform } from 'react-native';

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

  // GETTERS AND SETTERS STORAGE
  // ISSIGNEDIN
  getIsSignedIn = async () => {
    try {
      let isSignedIn = await AsyncStorage.getItem(GLOBALS.STORAGE.IS_SIGNED_IN);

      // Set Default Value
      if (isSignedIn == null) {
        isSignedIn = false;
        this.setIsSignedIn(isSignedIn);
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
