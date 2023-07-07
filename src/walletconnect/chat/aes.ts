import {encryptedPrivateKeyTypeV2} from '@pushprotocol/restapi';

import {hexToBytes} from './utils';

const KDFSaltSize = 32; // bytes
const AESGCMNonceSize = 12; // property iv

const hkdf = async (secret: Uint8Array, salt: Uint8Array): Promise<any> => {
  //@ts-ignore
  const key = await crypto.subtle.importKey('raw', secret, 'HKDF', false, [
    'deriveKey',
  ]);

  //@ts-ignore
  const res = await crypto.subtle.deriveKey(
    {name: 'HKDF', hash: 'SHA-256', salt, info: new ArrayBuffer(0)},
    key,
    {name: 'AES-GCM', length: 256},
    true, // false
    ['encrypt', 'decrypt'],
  );

  return res;
};

export const encryptV2 = async (
  data: Uint8Array,
  secret: Uint8Array,
  additionalData?: Uint8Array,
): Promise<any> => {
  //@ts-ignore
  const salt = crypto.getRandomValues(new Uint8Array(KDFSaltSize));

  //@ts-ignore
  const nonce = crypto.getRandomValues(new Uint8Array(AESGCMNonceSize));

  const key = await hkdf(secret, salt);

  const aesGcmParams: any = {
    name: 'AES-GCM',
    iv: nonce,
  };
  if (additionalData) {
    aesGcmParams.additionalData = additionalData;
  }
  //@ts-ignore
  const encrypted: ArrayBuffer = await crypto.subtle.encrypt(
    aesGcmParams,
    key,
    data,
  );

  return {
    ciphertext: bytesToHex(new Uint8Array(encrypted)),
    version: 'aes256GcmHkdfSha256',
    salt: bytesToHex(salt),
    nonce: bytesToHex(nonce),
    preKey: '',
  };
};

// aes256GcmHkdfSha256 decryption
export const decryptV2 = async (
  encryptedData: encryptedPrivateKeyTypeV2,
  secret: Uint8Array,
  additionalData?: Uint8Array,
): Promise<Uint8Array> => {
  
  const key = await hkdf(secret, hexToBytes(encryptedData.salt!));
  const aesGcmParams: any = {
    name: 'AES-GCM',
    iv: hexToBytes(encryptedData.nonce),
  };
  if (additionalData) {
    aesGcmParams.additionalData = additionalData;
  }
  // @ts-ignore
  const decrypted: ArrayBuffer = await crypto.subtle.decrypt(
    aesGcmParams,
    key,
    hexToBytes(encryptedData.ciphertext),
  );
  return new Uint8Array(decrypted);
};

const bytesToHex = (bytes: Uint8Array): string => {
  return bytes.reduce(
    (str, byte) => str + byte.toString(16).padStart(2, '0'),
    '',
  );
};
