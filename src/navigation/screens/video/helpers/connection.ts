import {ENV} from '@pushprotocol/restapi/src/lib/constants';
import envConfig from 'src/env.config';
import {caip10ToWallet} from 'src/helpers/CAIPHelper';
import {
  IDENTITY_TYPE,
  NOTIFICATION_TYPE,
  sendNotification,
} from 'src/push_video/payloads';
import MetaStorage from 'src/singletons/MetaStorage';

import {UserChatCredentials} from '../../chats/ChatScreen';

interface videoPayloadType {
  userToCall: string;
  fromUser: string;
  chatId: string;
  signalData: any;
  name: string;
  status: number;
}

export interface payloadType {
  sender: string;
  recipient: string;
  identity: string;
  source: string;
}

interface SendCallPayload {
  from: string;
  to: string;
  signalData: any;
  name: string;
  status: 1 | 2 | 3;
  chatId: string;
}

export const sendCallPayload = async ({
  signalData,
  from,
  to,
  status,
  name,
  chatId,
}: SendCallPayload) => {
  const {pgpPrivateKey}: UserChatCredentials =
    await MetaStorage.instance.getUserChatData();

  const videoPayload: videoPayloadType = {
    userToCall: caip10ToWallet(to),
    fromUser: caip10ToWallet(from),
    signalData,
    name,
    status,
    chatId,
  };

  let identityPayload = {
    notification: {
      title: 'VideoCall',
      body: 'VideoCall',
    },
    data: {
      amsg: 'VideoCall',
      asub: 'VideoCall',
      type: '3',
      etime: Date.now() + 245543,
      hidden: '1',
      videoMeta: videoPayload,
    },
  };

  const identityType: number = 2;
  const stringifiedData: string = JSON.stringify(identityPayload);
  const identity: string = `${identityType}+${stringifiedData}`;

  const payload: payloadType = {
    sender: `eip155:5:${videoPayload.fromUser}`,
    recipient: `eip155:5:${videoPayload.userToCall}`,
    identity: identity,
    source: 'PUSH_VIDEO',
  };

  // sendNotification({
  //   senderType: 1,
  //   signer: '',
  //   type: NOTIFICATION_TYPE.TARGETTED,
  //   identityType,
  //   notification: identityPayload.notification,
  // });

  const notificationText = `Video Call from ${payload.sender}`;

  await sendNotification({
    senderType: 1, // for chat notification
    signer: '',
    pgpPrivateKey: pgpPrivateKey,
    chatId: chatId,
    type: NOTIFICATION_TYPE.TARGETTED,
    identityType: IDENTITY_TYPE.DIRECT_PAYLOAD,
    notification: {
      title: notificationText,
      body: notificationText,
    },
    payload: {
      title: 'VideoCall',
      body: 'VideoCall',
      cta: '',
      img: '',
      additionalMeta: videoPayload,
    },
    recipients: payload.recipient,
    channel: payload.sender,
    env: envConfig.ENV as ENV,
  });
  // return _sendCallPayload(payload);
};

// const _sendCallPayload = async (payload: payloadType) => {
//   const requestOptions = {
//     method: 'POST',
//     headers: {'Content-Type': 'application/json'},
//     body: JSON.stringify(payload),
//   };
//   return fetch(
//     'https://backend-staging.epns.io/apis/v1/payloads/video/poc',
//     requestOptions,
//   );
// };
