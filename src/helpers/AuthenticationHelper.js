import * as Keychain from 'react-native-keychain';

import CryptoHelper from 'src/helpers/CryptoHelper';
import Web3Helper from 'src/helpers/Web3Helper';
import FeedDBHelper from 'src/helpers/FeedDBHelper';

import Notify from 'src/singletons/Notify';
import MetaStorage from 'src/singletons/MetaStorage';

import GLOBALS from 'src/Globals';

// Authentication Helper Function
const AuthenticationHelper = {
  // To Return false or Decrypted Private Key from Encrypted Private Key, code and hashedcode
  returnDecryptedPKey: async function(encryptedPKey, code, hashedCode) {
    let response = {};
    response.success = false;

    try {
      // Verify Hash Code
      const result = await CryptoHelper.verifyHash(code, hashedCode);

      if (result) {
        // Hash Verified, Decrypt PKey
        const pkey = CryptoHelper.decryptWithAES(encryptedPKey, code);

        // Now derive public address of this Private Key
        const walletObject = await Web3Helper.getWalletAddress(pkey);

        if (walletObject.success) {
          const storedWalletObject = await MetaStorage.instance.getStoredWallet();
          if (walletObject.wallet === storedWalletObject.wallet) {
            response.success = true;
            response.wallet = walletObject.wallet;
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
  },
  // To Wipe the Signed In User Data, this is a force reset
  wipeSignedInUser: async () => {
    // Set user locked to true
    await MetaStorage.instance.setUserLocked(true);

    // Call Remove User Process
    await AuthenticationHelper._removeDataOfUser();
  },
  // To reset signed in user, this is a graceful reset
  resetSignedInUser: async () => {
    // Set user locked to false, useful if user is locked
    await MetaStorage.instance.setUserLocked(false);

    // Set Signed Status as false also
    await MetaStorage.instance.setIsSignedIn(false);

    // Call Remove User Process
    await AuthenticationHelper._removeDataOfUser();

    // Set Passcode Attempts to MAX
    await MetaStorage.instance.setRemainingPasscodeAttempts(GLOBALS.CONSTANTS.MAX_PASSCODE_ATTEMPTS);
  },
  // To remove data of the user
  _removeDataOfUser: async () => {
    // First pull the wallet info to disassociate token
    const wallet = await MetaStorage.instance.getStoredWallet();
    await Notify.instance.dissaociateToken(wallet.wallet); // takes care of deleting push as well

    // Destroy Keychain
    await Keychain.resetGenericPassword();

    // Set Hashed Passcode and Encrypted PKey
    await MetaStorage.instance.setEncryptedPKeyAndHashedPasscode('', '');

    // Set Wallet Info Object As Null
    await MetaStorage.instance.setStoredWallet({
      ensRefreshTime: 0, // Time in epoch
      ens: '',
      wallet: '',
    });

    // Reset Feed DB, create table purges it as well
    const db = FeedDBHelper.getDB();
    FeedDBHelper.createTable(db);
  }
}

export default AuthenticationHelper;
