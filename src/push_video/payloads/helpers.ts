import {walletType} from '@pushprotocol/restapi';
import {ENV} from '@pushprotocol/restapi/src/lib/constants';
import {
  IDENTITY_TYPE,
  NOTIFICATION_TYPE,
} from '@pushprotocol/restapi/src/lib/payloads/constants';
import {pgpSignBody} from 'src/navigation/screens/chats/helpers/signatureHelper';
import {v4 as uuidv4} from 'uuid';

export function getUUID() {
  return uuidv4();
}

export async function getVerificationProof({
  senderType,
  signer,
  chainId,
  notificationType,
  identityType,
  verifyingContract,
  payload,
  ipfsHash,
  graph = {},
  uuid,
  chatId,
  pgpPrivateKey,
}: {
  senderType: 0 | 1;
  signer: any;
  chainId: number;
  notificationType: NOTIFICATION_TYPE;
  identityType: IDENTITY_TYPE;
  verifyingContract: string;
  payload: any;
  ipfsHash?: string;
  graph?: any;
  uuid: string;
  // for notifications which have additionalMeta in payload
  chatId?: string;
  wallet?: walletType;
  pgpPrivateKey?: string;
  env?: ENV;
}) {
  let message = null;
  let verificationProof = null;

  switch (identityType) {
    case IDENTITY_TYPE.MINIMAL: {
      message = {
        data: `${identityType}+${notificationType}+${payload.notification.title}+${payload.notification.body}`,
      };
      break;
    }
    case IDENTITY_TYPE.IPFS: {
      message = {
        data: `1+${ipfsHash}`,
      };
      break;
    }
    case IDENTITY_TYPE.DIRECT_PAYLOAD: {
      const payloadJSON = JSON.stringify(payload);
      message = {
        data: `2+${payloadJSON}`,
      };
      break;
    }
    case IDENTITY_TYPE.SUBGRAPH: {
      message = {
        data: `3+graph:${graph?.id}+${graph?.counter}`,
      };
      break;
    }
    default: {
      throw new Error('Invalid IdentityType');
    }
  }

  switch (senderType) {
    case 0: {
      const type = {
        Data: [{name: 'data', type: 'string'}],
      };
      const domain = {
        name: 'EPNS COMM V1',
        chainId: chainId,
        verifyingContract: verifyingContract,
      };
      const signature = await signer._signTypedData(domain, type, message);
      verificationProof = `eip712v2:${signature}::uid::${uuid}`;
      break;
    }
    case 1: {
      const signature = await pgpSignBody({bodyToBeHashed: message});
      verificationProof = `pgpv2:${signature}:meta:${chatId}::uid::${uuid}`;
      break;
    }
    default: {
      throw new Error('Invalid SenderType');
    }
  }
  return verificationProof;
}
