import {IUser} from '@pushprotocol/restapi';
import Globals from 'src/Globals';

export const UserHelper = {
  displayDefaultUser: ({caip10}: {caip10: string}): IUser => {
    const userCreated: IUser = {
      did: caip10,
      wallets: caip10,
      publicKey: '',
      profilePicture: Globals.CONSTANTS.DEFAULT_PROFILE_PICTURE,
      encryptedPrivateKey: '',
      encryptionType: '',
      signature: '',
      sigType: '',
      encryptedPassword: null,
      about: null,
      name: null,
      numMsg: 1,
      allowedNumMsg: 100,
      nftOwner: null,
      linkedListHash: null,
      msgSent: 0,
      maxMsgPersisted: 0,
      profile: {
        name: null,
        desc: null,
        picture: Globals.CONSTANTS.DEFAULT_PROFILE_PICTURE,
        profileVerificationProof: null,
        blockedUsersList: null,
      },
      verificationProof: '',
    };
    return userCreated;
  },
};
