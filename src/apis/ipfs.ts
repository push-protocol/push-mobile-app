import GLOBALS from 'src/Globals';

const BASE_URL = GLOBALS.LINKS.W2W_EPNS_SERVER;

// const BASE_URL = 'https://backend-dev.epns.io/apis';
// const BASE_URL = 'https://backend-staging.epns.io/apis';

export interface MessageIPFSWithCID extends MessageIPFS {
  cid: string;
}

export interface MessageIPFS {
  fromCAIP10: string;
  toCAIP10: string;
  fromDID: string;
  toDID: string;
  messageType: string;
  messageContent: string;
  signature: string;
  sigType: string;
  link: string | null;
  timestamp?: number;
  encType: string;
  encryptedSecret: string;
}

export const getFromIPFS = async (cid: string): Promise<MessageIPFSWithCID> => {
  const response: any = await fetch(BASE_URL + '/v1/ipfs/' + cid, {
    method: 'GET',
    headers: {
      'content-Type': 'application/json',
    },
  });

  const messageIPFS: MessageIPFS = await response.json();
  const messageIPFSWithCID: MessageIPFSWithCID = {...messageIPFS, cid};
  return messageIPFSWithCID;
};

export const postIPFS = async (data: string): Promise<string> => {
  const response: any = await fetch(BASE_URL + '/v1/ipfs/upload', {
    method: 'POST',
    headers: {
      'content-Type': 'application/json',
    },
    body: JSON.stringify({
      data,
    }),
  });
  const cidResponse: {cid: string} = await response.json();
  return cidResponse.cid;
};
