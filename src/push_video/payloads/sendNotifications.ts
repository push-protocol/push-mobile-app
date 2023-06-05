import {ISendNotificationInputOptions, SignerType} from '@pushprotocol/restapi';
import {getWallet} from '@pushprotocol/restapi/src/lib/chat/helpers';
import {ENV} from '@pushprotocol/restapi/src/lib/constants';
import axios from 'axios';
import envConfig from 'src/env.config';

import {
  getCAIPAddress,
  getCAIPDetails,
  getCAIPWithChainId,
  getConfig,
  isValidETHAddress,
} from '../helpers';
import {IDENTITY_TYPE} from './constants';
import {
  getPayloadForAPIInput,
  getPayloadIdentity,
  getRecipientFieldForAPIPayload,
  getRecipients,
  getSource,
  getUUID,
  getVerificationProof,
} from './helpers';

const DEFAULT_DOMAIN = 'push.org';

/**
 * Validate options for some scenarios
 */
function validateOptions(options: any) {
  if (!options?.channel) {
    throw '[Push SDK] - Error - sendNotification() - "channel" is mandatory!';
  }
  if (!isValidETHAddress(options.channel)) {
    throw '[Push SDK] - Error - sendNotification() - "channel" is invalid!';
  }
  if (options.senderType === 0 && options.signer === undefined) {
    throw '[Push SDK] - Error - sendNotification() - "signer" is mandatory!';
  }
  if (options.senderType === 1 && options.pgpPrivateKey === undefined) {
    throw '[Push SDK] - Error - sendNotification() - "pgpPrivateKey" is mandatory!';
  }

  /**
   * Apart from IPFS, GRAPH use cases "notification", "payload" is mandatory
   */
  if (
    options?.identityType === IDENTITY_TYPE.DIRECT_PAYLOAD ||
    options?.identityType === IDENTITY_TYPE.MINIMAL
  ) {
    if (!options.notification) {
      throw '[Push SDK] - Error - sendNotification() - "notification" mandatory for Identity Type: Direct Payload, Minimal!';
    }
    if (!options.payload) {
      throw '[Push SDK] - Error - sendNotification() - "payload" mandatory for Identity Type: Direct Payload, Minimal!';
    }
  }
}

export enum VideoCallStatus {
  UNINITIALIZED,
  INITIALIZED,
  RECEIVED,
  CONNECTED,
  DISCONNECTED,
  RETRY_INITIALIZED,
  RETRY_RECEIVED,
}

export enum ADDITIONAL_META_TYPE {
  CUSTOM = 0,
  PUSH_VIDEO = 1,
}

interface VideoCallInfoType {
  recipientAddress: string;
  senderAddress: string;
  chatId: string;
  signalData: any;
  status: VideoCallStatus;
  env: ENV;
}

interface UserInfoType {
  signer: SignerType | string; // updated to string for now
  chainId: number;
  pgpPrivateKey: string;
}

interface VideoDataType {
  recipientAddress: string;
  senderAddress: string;
  chatId: string;
  signalData?: any;
  status: VideoCallStatus;
}

export const sendVideoCallNotification = async (
  {signer, chainId, pgpPrivateKey}: UserInfoType,
  {
    recipientAddress,
    senderAddress,
    chatId,
    signalData = null,
    status,
    env,
  }: VideoCallInfoType,
) => {
  try {
    const videoData: VideoDataType = {
      recipientAddress,
      senderAddress,
      chatId,
      signalData,
      status,
    };

    // console.log('sendVideoCallNotification', 'videoData', videoData);

    // console.log('senderAddress', senderAddress);
    // console.log('recipientAddress', recipientAddress);
    const senderAddressInCaip = getCAIPWithChainId(senderAddress, chainId);
    const recipientAddressInCaip = getCAIPWithChainId(
      recipientAddress,
      chainId,
    );

    // console.log(
    //   'sendVideoCallNotification',
    //   'senderAddressInCaip',
    //   senderAddressInCaip,
    // );

    const notificationText = `Video Call from ${senderAddress}`;

    await sendNotification({
      senderType: 1, // for chat notification
      signer,
      pgpPrivateKey,
      chatId,
      type: 3,
      identityType: 2,
      notification: {
        title: notificationText,
        body: notificationText,
      },
      payload: {
        title: 'VideoCall',
        body: 'VideoCall',
        cta: '',
        img: '',
        additionalMeta: {
          type: `${ADDITIONAL_META_TYPE.PUSH_VIDEO}+1`,
          data: JSON.stringify(videoData),
        },
      },
      recipients: recipientAddressInCaip,
      channel: senderAddressInCaip,
      env,
    });
  } catch (err) {
    console.log('Error occured while sending notification for video call', err);
  }
};

let payloadCopy: any = null;

export async function sendNotification(options: ISendNotificationInputOptions) {
  try {
    const {
      /* 
        senderType = 0 for channel notification (default)
        senderType = 1 for chat notification
      */
      senderType = 0,
      signer,
      type,
      identityType,
      payload,
      recipients,
      channel,
      graph,
      ipfsHash,
      env = envConfig.ENV as ENV,
      chatId,
      pgpPrivateKey,
    } = options || {};

    validateOptions(options);

    if (
      payload &&
      payload.additionalMeta &&
      typeof payload.additionalMeta === 'object' &&
      !payload.additionalMeta.domain
    ) {
      payload.additionalMeta.domain = DEFAULT_DOMAIN;
    }

    if (signer === undefined) {
      throw new Error(`Signer is necessary!`);
    }

    const wallet = getWallet({account: null, signer});
    const _channelAddress = getCAIPAddress(env, channel, 'Channel');
    // console.log('got channel addrs', _channelAddress);

    const channelCAIPDetails = getCAIPDetails(_channelAddress);

    if (!channelCAIPDetails) throw Error('Invalid Channel CAIP!');

    const uuid = getUUID();
    // console.log('got uuid', uuid);

    const chainId = parseInt(channelCAIPDetails.networkId, 10);

    const {API_BASE_URL, EPNS_COMMUNICATOR_CONTRACT} = getConfig(
      envConfig.ENV as ENV,
      channelCAIPDetails,
    );

    const _recipients = await getRecipients({
      env,
      notificationType: type,
      channel: _channelAddress,
      recipients,
      secretType: payload?.sectype,
    });

    // console.log('got chain id', chainId);
    // console.log('got recipients', _recipients);

    const notificationPayload = getPayloadForAPIInput(options, _recipients);

    // console.log('notificationPayload', notificationPayload);
    payloadCopy = notificationPayload;

    const verificationProof = await getVerificationProof({
      senderType,
      signer,
      chainId,
      identityType,
      notificationType: type,
      verifyingContract: EPNS_COMMUNICATOR_CONTRACT,
      payload: notificationPayload,
      graph,
      ipfsHash,
      uuid,
      // for the pgpv2 verfication proof
      chatId,
      wallet,
      pgpPrivateKey,
      env,
    });

    const identity = getPayloadIdentity({
      identityType,
      payload: notificationPayload,
      notificationType: type,
      graph,
      ipfsHash,
    });

    const source = getSource(chainId, identityType, senderType);

    const apiPayload = {
      verificationProof,
      identity,
      sender:
        senderType === 1
          ? `${channelCAIPDetails?.blockchain}:${channelCAIPDetails?.address}`
          : _channelAddress,
      source,
      /** note this recipient key has a different expectation from the BE API, see the funciton for more */
      recipient: getRecipientFieldForAPIPayload({
        env,
        notificationType: type,
        recipients: recipients || '',
        channel: _channelAddress,
      }),
    };

    const requestURL = `${API_BASE_URL}/v1/payloads/`;
    // console.log('api', requestURL);
    // console.log('load', JSON.stringify(apiPayload));

    const res = await axios.post(requestURL, apiPayload, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    // console.log('payloadcopy works', payloadCopy);
    return res;
  } catch (err: any) {
    console.error('[Push SDK] - Error - sendNotification() - ', err);
    console.log(err.response?.data);
    // console.log('payloadCopy', payloadCopy);
    throw err;
  }
}
