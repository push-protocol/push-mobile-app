import {caip10ToWallet} from 'src/helpers/CAIPHelper';

export interface videoPayloadType {
  userToCall: string;
  fromUser: string;
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
  status: 1 | 2;
}

export const sendCallPayload = ({
  signalData,
  from,
  to,
  status,
  name,
}: SendCallPayload) => {
  const videoPayload: videoPayloadType = {
    userToCall: caip10ToWallet(to),
    fromUser: caip10ToWallet(from),
    signalData,
    name,
    status,
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
    sender: `eip155:42:${videoPayload.fromUser}`,
    recipient: `eip155:42:${videoPayload.userToCall}`,
    identity: identity,
    source: 'PUSH_VIDEO',
  };

  return _sendCallPayload(payload);
};

const _sendCallPayload = async (payload: payloadType) => {
  const requestOptions = {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(payload),
  };
  return fetch(
    'https://backend-staging.epns.io/apis/v1/payloads/video/poc',
    requestOptions,
  );
};
