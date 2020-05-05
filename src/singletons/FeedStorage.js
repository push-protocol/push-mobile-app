import React from 'react';
import {
  Platform
} from 'react-native';

import SQLite from "react-native-sqlite-2";

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


}
