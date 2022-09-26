import ENV_CONFIG from 'src/env.config';

export interface User {
  did: string;
  wallets: string;
  profilePicture: string | null;
  publicKey: string;
  encryptedPrivateKey: string;
  encryptionType: string;
  signature: string;
  sigType: string;
  about: string | null;
  name: string | null;
  numMsg: number;
  allowedNumMsg: number;
  linkedListHash?: string | null;
}

const BASE_URL = ENV_CONFIG.EPNS_SERVER;

export const createUser = async ({
  caip10,
  did,
  publicKey,
  encryptedPrivateKey,
  encryptionType,
  signature,
  sigType,
}: {
  caip10: string;
  did: string;
  publicKey: string;
  encryptedPrivateKey: string;
  encryptionType: string;
  signature: string;
  sigType: string;
}): Promise<User> => {
  const response = await fetch(ENV_CONFIG.EPNS_SERVER + '/v1/w2w/users', {
    method: 'POST',
    headers: {
      'content-Type': 'application/json',
    },
    body: JSON.stringify({
      caip10,
      did,
      publicKey,
      encryptedPrivateKey,
      encryptionType,
      signature,
      sigType,
    }),
  }).catch(e => {
    console.log(e);
    throw new Error(e);
  });

  console.log(response);

  const data: User = await response.json();
  return data;
};

export const getUser = async (caip10: string): Promise<User | undefined> => {
  let retry = 0;

  for (let i = 0; i < 3; i++) {
    try {
      let path = '/v1/w2w/users';
      if (caip10) {
        path += `?caip10=${caip10}`;
      }
      const response = await fetch(BASE_URL + path, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data: User = await response.json();
      return data;
    } catch (err) {
      if (retry > 1) {
        console.log('An Error Occurred! Please Reload the Page');
      }
      console.log('Error in the API call', err);
      retry++;
      continue;
    }
  }
};
