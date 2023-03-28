import * as PushAPI from '@pushprotocol/restapi';
import CryptoJS from 'crypto-js';
import {generateKeyPair} from 'src/helpers/w2w/pgp';

const generateHash = (message: any): string => {
  const hash = CryptoJS.SHA256(JSON.stringify(message)).toString(
    CryptoJS.enc.Hex,
  );
  return hash;
};

const createUser = async () => {
  const keyPairs = await generateKeyPair();
  const createdProfileMessage =
    'Create Push Chat Profile \n' + generateHash(keyPairs.publicKeyArmored);
  return createdProfileMessage;
};

export {createUser};
