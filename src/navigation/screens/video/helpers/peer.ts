import {createSocketConnection} from '@pushprotocol/socket';
import {ENV, EVENTS} from '@pushprotocol/socket/src/lib/constants';
import RNPeer from 'react-native-simple-peer';
import {
  MediaStream,
  RTCIceCandidate,
  RTCPeerConnection,
  RTCSessionDescription,
} from 'react-native-webrtc';
import envConfig from 'src/env.config';
import {caip10ToWallet} from 'src/helpers/CAIPHelper';
import JsonHelper from 'src/helpers/JsonHelper';
import {sendVideoCallNotification} from 'src/push_video/payloads';
import {Call} from 'src/redux/videoSlice';

import {sendCallPayload} from './connection';
import {VIDEO_DATA} from './constants';

export type IMediaStream = MediaStream | null;

export enum VideoCallStatus {
  UNINITIALIZED,
  INITIALIZED,
  RECEIVED,
  CONNECTED,
  DISCONNECTED,
  RETRY_INITIALIZED,
  RETRY_RECEIVED,
}

export type PeerData = {
  stream: IMediaStream;
  audio: boolean | null;
  video: boolean | null;
  address: string;
  status: VideoCallStatus;
  retryCount: number;
};

export type VideoCallData = {
  meta: {
    chatId: string;
    initiator: {
      address: string;
      signal: any;
    };
    broadcast?: {
      livepeerInfo: any;
      hostAddress: string;
      coHostAddress: string;
    };
  };
  local: {
    stream: IMediaStream;
    audio: boolean | null;
    video: boolean | null;
    address: string;
  };
  incoming: [PeerData];
};

const initVideoCallData: VideoCallData = {
  meta: {
    chatId: '',
    initiator: {
      address: '',
      signal: null,
    },
  },
  local: {
    stream: null,
    audio: null,
    video: null,
    address: '',
  },
  incoming: [
    {
      stream: null,
      audio: null,
      video: null,
      address: '',
      status: VideoCallStatus.UNINITIALIZED,
      retryCount: 0,
    },
  ],
};

export type VideoRequestInputOptions = {
  senderAddress: string;
  recipientAddress: string;
  chatId: string;
  onReceiveMessage?: (message: string) => void;
  retry?: boolean;
};

export type VideoAcceptRequestInputOptions = {
  signalData: any;
  senderAddress: string;
  recipientAddress: string;
  chatId: string;
  onReceiveMessage?: (message: string) => void;
  retry?: boolean;
};

interface UsePeerArgs {
  calling: boolean;
  userMedia: MediaStream;
  connectionRef: any;
  setAnotherUserMedia: any;
  call: Call;
  toAddress: string;
  fromAddress: string;
  rcalled: any;
  rsetCalled: any;
  isVideoOn: boolean;
  isAudioOn: boolean;
  setIncomingVideoStatus: (status: boolean) => void;
  setIncomingAudioStatus: (status: boolean) => void;
  onEndCall: () => void;
  pgpPrivateKey: string;
}

let k = false;

const usePeer = ({
  calling,
  userMedia,
  connectionRef,
  setAnotherUserMedia,
  call,
  toAddress,
  fromAddress,
  rcalled,
  rsetCalled,
  isVideoOn,
  isAudioOn,
  setIncomingVideoStatus,
  setIncomingAudioStatus,
  onEndCall,
  pgpPrivateKey,
}: UsePeerArgs) => {
  let peer = new RNPeer({
    initiator: calling,
    trickle: true,
    debugConsole: false,
    config: {},
    webRTC: {
      RTCPeerConnection,
      RTCIceCandidate,
      RTCSessionDescription,
    },
    stream: userMedia,
  });

  let data = initVideoCallData;
  console.log('initVideoCallData', initVideoCallData);

  const request = (options: VideoRequestInputOptions) => {
    const {
      senderAddress, // notification sender
      recipientAddress, // notification receiver
      chatId,
      retry = false,
    } = options || {};

    try {
      console.log('request', 'options', options, 'localStream');

      peer = new RNPeer({
        initiator: calling,
        trickle: true,
        debugConsole: false,
        config: {},
        webRTC: {
          RTCPeerConnection,
          RTCIceCandidate,
          RTCSessionDescription,
        },
        stream: userMedia,
      });

      // @ts-ignore
      peer.on('signal', (_data: any) => {
        data.meta.initiator.signal = _data;

        sendVideoCallNotification(
          {
            chainId: envConfig.CHAIN_ID,
            pgpPrivateKey: pgpPrivateKey,
            signer: '',
          },
          {
            chatId: chatId,
            recipientAddress: recipientAddress,
            senderAddress: senderAddress,
            signalData: _data,
            status: retry
              ? VideoCallStatus.RETRY_INITIALIZED
              : VideoCallStatus.INITIALIZED,
            env: envConfig.ENV as ENV,
          },
        );
      });

      // @ts-ignore
      peer.on('connect', () => {
        peer.send(`initial message from ${senderAddress}`);
        peer.send(
          JSON.stringify({
            type: VIDEO_DATA.VIDEO_STATUS,
            isVideoOn: isVideoOn,
          }),
        );
        peer.send(
          JSON.stringify({
            type: VIDEO_DATA.AUDIO_STATUS,
            isAudioOn: isAudioOn,
          }),
        );
      });

      // @ts-ignore
      peer.on('data', (_data: any) => {
        if (JsonHelper.isJSON(_data)) {
          const parsedData = JSON.parse(_data);
          if (parsedData.type === VIDEO_DATA.VIDEO_STATUS) {
            console.log('IS VIDEO ON', parsedData.isVideoOn);
            setIncomingVideoStatus(parsedData.isVideoOn);
            data.incoming[0].video = parsedData.isVideoOn;
          }

          if (parsedData.type === VIDEO_DATA.AUDIO_STATUS) {
            console.log('IS AUDIO ON', parsedData.isAudioOn);
            setIncomingAudioStatus(parsedData.isAudioOn);
            data.incoming[0].audio = parsedData.isAudioOn;
          }

          if (parsedData.type === VIDEO_DATA.END_CALL) {
            console.log('END CALL', parsedData.endCall);
            onEndCall();
            data = initVideoCallData;
          }
        }
      });

      // @ts-ignore
      peer.on('stream', (currentStream: MediaStream) => {
        console.log('checking data value!!!', data);
        console.log('received incoming stream', currentStream);
        setAnotherUserMedia(currentStream);
        data.incoming[0].stream = currentStream;
      });

      data.local.address = senderAddress;
      data.incoming[0].address = recipientAddress;
      data.meta.chatId = chatId;
      data.meta.initiator.address = senderAddress;
      data.incoming[0].status = retry
        ? VideoCallStatus.RETRY_INITIALIZED
        : VideoCallStatus.INITIALIZED;
      data.incoming[0].retryCount += retry ? 1 : 0;
    } catch (err) {
      console.log('error in request', err);
    }
  };

  const acceptRequest = (options: VideoAcceptRequestInputOptions) => {
    const {
      signalData,
      senderAddress, // notification sender
      recipientAddress, // notification receiver
      chatId,
      retry = false,
    } = options || {};
    console.log('checking data value!!!', data);

    try {
      console.log(
        'accept request',
        'options',
        options,
        'localStream',
        data.local.stream,
      );

      peer = new RNPeer({
        initiator: calling,
        trickle: true,
        debugConsole: false,
        config: {},
        webRTC: {
          RTCPeerConnection,
          RTCIceCandidate,
          RTCSessionDescription,
        },
        stream: userMedia,
      });

      peer.signal(signalData);

      // @ts-ignore
      peer.on('signal', (_data: any) => {
        data.meta.initiator.signal = _data;
        console.log('checking data value!!!', data);

        sendVideoCallNotification(
          {
            chainId: envConfig.CHAIN_ID,
            pgpPrivateKey: pgpPrivateKey,
            signer: '',
          },
          {
            chatId: chatId,
            recipientAddress: recipientAddress,
            senderAddress: senderAddress,
            signalData: _data,
            status: retry
              ? VideoCallStatus.RETRY_RECEIVED
              : VideoCallStatus.RECEIVED,
            env: envConfig.ENV as ENV,
          },
        );
      });

      // @ts-ignore
      peer.on('connect', () => {
        peer.send('initial message from receiver');
        peer.send(
          JSON.stringify({
            type: VIDEO_DATA.VIDEO_STATUS,
            isVideoOn: isVideoOn,
          }),
        );
        peer.send(
          JSON.stringify({
            type: VIDEO_DATA.AUDIO_STATUS,
            isAudioOn: isAudioOn,
          }),
        );

        data.incoming[0].status = VideoCallStatus.CONNECTED;
      });

      // @ts-ignore
      peer.on('data', (_data: any) => {
        console.log('checking data value!!!', data);

        if (JsonHelper.isJSON(_data)) {
          const parsedData = JSON.parse(_data);
          if (parsedData.type === VIDEO_DATA.VIDEO_STATUS) {
            console.log('IS VIDEO ON', parsedData.isVideoOn);
            data.incoming[0].video = parsedData.isVideoOn;
            setIncomingVideoStatus(parsedData.isVideoOn);
          }

          if (parsedData.type === VIDEO_DATA.AUDIO_STATUS) {
            console.log('IS AUDIO ON', parsedData.isAudioOn);
            data.incoming[0].audio = parsedData.isAudioOn;
            setIncomingAudioStatus(parsedData.isAudioOn);
          }

          if (parsedData.type === VIDEO_DATA.END_CALL) {
            console.log('END CALL', parsedData.endCall);
            onEndCall();
            data = initVideoCallData;
          }
        }
      });

      // @ts-ignore
      peer.on('stream', (currentStream: MediaStream) => {
        console.log('checking data value!!!', data);

        console.log('received incoming stream', currentStream);
        setAnotherUserMedia(currentStream);
        data.incoming[0].stream = currentStream;
      });

      data.local.address = senderAddress;
      data.incoming[0].address = recipientAddress;
      data.meta.chatId = chatId;
      data.meta.initiator.address = senderAddress;
      data.incoming[0].status = retry
        ? VideoCallStatus.RETRY_RECEIVED
        : VideoCallStatus.RECEIVED;
      data.incoming[0].retryCount += retry ? 1 : 0;

      console.log('checking data value!!!', data);
    } catch (err) {
      console.log('error in accept request', err);

      if (data.incoming[0].retryCount >= 5) {
        console.log('Max retries exceeded, please try again.');
        onEndCall();
      }

      sendVideoCallNotification(
        {
          chainId: envConfig.CHAIN_ID,
          pgpPrivateKey: pgpPrivateKey,
          signer: '',
        },
        {
          chatId: chatId,
          recipientAddress: recipientAddress,
          senderAddress: senderAddress,
          signalData: null,
          status: VideoCallStatus.RETRY_INITIALIZED,
          env: envConfig.ENV as ENV,
        },
      );
    }
  };

  if (calling) {
    console.log('calling the peer');

    try {
      const socket = createSocketConnection({
        user: caip10ToWallet(fromAddress),
        env: envConfig.ENV as ENV,
        socketOptions: {autoConnect: true, reconnectionAttempts: 3},
      });

      if (socket) {
        socket.on(EVENTS.USER_FEEDS, (feedItem: any) => {
          console.log('got feed abishek', Object.keys(feedItem));
          console.log('got feed abishek', feedItem.payload.data);
          try {
            if (feedItem.source === 'PUSH_VIDEO') {
              // * OLD CODE FOR REFERENCE
              // const {payload} = feedItem || {};
              // console.log('got the payload', payload.data);
              // const videoMeta = JSON.parse(payload.data.additionalMeta);
              // if (videoMeta.status === 1) {
              // } else if (videoMeta.status === 2) {
              //   const signalData = videoMeta.signalData;
              //   console.log('got the signal data', signalData);
              //   peer.signal(signalData);
              // }
              const payload = feedItem.payload;
              const additionalMeta = payload.data.additionalMeta;
              const videoCallMetaData = JSON.parse(additionalMeta.data);

              if (videoCallMetaData.status === VideoCallStatus.RETRY_RECEIVED) {
                const {signalData} = additionalMeta;
                try {
                  peer.signal(signalData);
                  data.incoming[0].status = VideoCallStatus.CONNECTED;
                } catch (e) {
                  if (data.incoming[0].retryCount >= 5) {
                    console.log('retry count exceeded');
                    onEndCall();
                  }
                  request({
                    chatId: data.meta.chatId,
                    retry: true,
                    recipientAddress: data.incoming[0].address,
                    senderAddress: data.local.address,
                  });
                }
              } else if (
                videoCallMetaData.status ===
                  VideoCallStatus.RETRY_INITIALIZED &&
                calling
              ) {
                request({
                  chatId: data.meta.chatId,
                  retry: true,
                  recipientAddress: data.incoming[0].address,
                  senderAddress: data.local.address,
                });
              } else if (
                videoCallMetaData.status ===
                  VideoCallStatus.RETRY_INITIALIZED &&
                !calling
              ) {
                const {signalData} = additionalMeta;

                acceptRequest({
                  chatId: data.meta.chatId,
                  retry: true,
                  recipientAddress: data.incoming[0].address,
                  senderAddress: data.local.address,
                  signalData,
                });
              }
            }
          } catch (e) {
            console.error('Notification error: ', e);
          }
        });

        socket.on(EVENTS.CONNECT, () => {
          console.log('*****() socket connection connection done');
          peer.send(
            JSON.stringify({
              type: VIDEO_DATA.VIDEO_STATUS,
              isVideoOn: isVideoOn,
            }),
          );
          peer.send(
            JSON.stringify({
              type: VIDEO_DATA.AUDIO_STATUS,
              isAudioOn: isAudioOn,
            }),
          );
        });

        socket.on(EVENTS.DISCONNECT, () => {
          console.log('caller disconn');
        });
      }
    } catch (error) {
      console.log('err', error);
    }

    // @ts-ignore
    peer.on('signal', (_data: any) => {
      if (!rcalled && !k) {
        console.log('CALL USER -> SIGNAL CALLBACK');
        rsetCalled(true);
        k = true;

        // ring the user
        sendCallPayload({
          from: fromAddress,
          to: toAddress,
          name: 'John Doe',
          signalData: _data,
          status: 1,
          chatId: call.chatId,
        });
        // .then(r => console.log(r.status))
        // .catch(e => console.error(e));
      }
    });
  } else {
    console.log('answer call -> data');
    peer.signal(call.signal);
    console.log('Sending Payload for answer call - Step 1');

    // @ts-ignore
    peer.on('signal', (_data: any) => {
      console.log('ANSWER CALL -> SIGNAL CALLBACK');

      // send answer call notification
      console.log('Sending Payload for answer call - Peer on Signal - Step 2');
      if (!rcalled) {
        rsetCalled(true);
        sendCallPayload({
          from: toAddress,
          to: fromAddress,
          name: 'name',
          signalData: _data,
          status: 2,
          chatId: call.chatId,
        });
        // .then(r => console.log(r.status))
        // .catch(e => console.error(e));
      }
    });
  }

  // @ts-ignore
  peer.on('error', (err: any) => {
    console.log('!!!!!!!! err', err);
  });

  // @ts-ignore
  peer.on('connect', () => {
    // wait for 'connect' event before using the data channel
    peer.send('hey caller, how is it going?');

    peer.send(
      JSON.stringify({type: VIDEO_DATA.VIDEO_STATUS, isVideoOn: isVideoOn}),
    );
    peer.send(
      JSON.stringify({type: VIDEO_DATA.AUDIO_STATUS, isAudioOn: isAudioOn}),
    );
  });

  // @ts-ignore
  peer.on('stream', (currentStream: MediaStream) => {
    console.log('++ GOT STREAM BACK IN ANSWERCALL', currentStream);
    setAnotherUserMedia(currentStream);
  });

  // @ts-ignore
  peer.on('data', (_data: any) => {
    if (JsonHelper.isJSON(_data)) {
      const jsonData = JSON.parse(_data);
      if (jsonData.type === VIDEO_DATA.VIDEO_STATUS) {
        setIncomingVideoStatus(jsonData.isVideoOn);
      } else if (jsonData.type === VIDEO_DATA.AUDIO_STATUS) {
        setIncomingAudioStatus(jsonData.isAudioOn);
      } else if (jsonData.type === VIDEO_DATA.END_CALL) {
        onEndCall();
      }
    }
  });

  // @ts-ignore
  peer.on('disconnect', () => {
    onEndCall();
  });

  connectionRef.current = peer;

  return peer;
};

export {usePeer};
