import {SignerType, VideoCallStatus} from '@pushprotocol/restapi';
import Constants, {ENV} from '@pushprotocol/restapi/src/lib/constants';
import {getCAIPWithChainId} from '@pushprotocol/restapi/src/lib/helpers';
import {
  NOTIFICATION_TYPE,
  SPACE_ACCEPT_REQUEST_TYPE,
  SPACE_DISCONNECT_TYPE,
  SPACE_REQUEST_TYPE,
  VIDEO_CALL_TYPE,
} from '@pushprotocol/restapi/src/lib/payloads/constants';

import {sendNotification} from '../payloads';

export interface CallDetailsType {
  type: SPACE_REQUEST_TYPE | SPACE_ACCEPT_REQUEST_TYPE | SPACE_DISCONNECT_TYPE;
  data: Record<string, unknown>;
}

export interface VideoCallInfoType {
  recipientAddress: string;
  senderAddress: string;
  chatId: string;
  signalData: any;
  status: VideoCallStatus;
  env?: ENV;
  callType?: VIDEO_CALL_TYPE;
  callDetails?: CallDetailsType;
}

export interface UserInfoType {
  signer: SignerType;
  chainId: number;
  pgpPrivateKey: string;
}

export interface VideoDataType {
  recipientAddress: string;
  senderAddress: string;
  chatId: string;
  signalData?: any;
  status: VideoCallStatus;
  callDetails?: CallDetailsType;
}

export const sendVideoCallNotification = async (
  {signer, chainId, pgpPrivateKey}: UserInfoType,
  {
    recipientAddress,
    senderAddress,
    chatId,
    status,
    signalData = null,
    env = Constants.ENV.PROD,
    callType = VIDEO_CALL_TYPE.PUSH_VIDEO,
    callDetails,
  }: VideoCallInfoType,
) => {
  try {
    const videoData: VideoDataType = {
      recipientAddress,
      senderAddress,
      chatId,
      signalData,
      status,
      callDetails,
    };

    const senderAddressInCaip = getCAIPWithChainId(senderAddress, chainId);
    const recipientAddressInCaip = getCAIPWithChainId(
      recipientAddress,
      chainId,
    );

    const notificationText = `Video Call from ${senderAddress}`;

    const notificationType = NOTIFICATION_TYPE.TARGETTED;

    await sendNotification({
      senderType: 1, // for chat notification
      signer,
      pgpPrivateKey,
      chatId,
      type: notificationType,
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
          type: `${callType}+1`,
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
