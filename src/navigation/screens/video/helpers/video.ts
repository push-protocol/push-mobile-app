// @ts-ignore
import {ENV} from '@pushprotocol/restapi/src/lib/constants';
import {produce} from 'immer';
import {DeviceEventEmitter, Platform} from 'react-native';
import InCallManager from 'react-native-incall-manager';
import RNPeer from 'react-native-simple-peer';
import {
  MediaStream,
  RTCIceCandidate,
  RTCPeerConnection,
  RTCSessionDescription,
} from 'react-native-webrtc';
import {mediaDevices} from 'react-native-webrtc';
import {initVideoCallData} from 'src/contexts/VideoContext';
import envConfig from 'src/env.config';
import JsonHelper from 'src/helpers/JsonHelper';
import {sendVideoCallNotification} from 'src/push_video/payloads';
import {
  endStream,
  enableAudio as restartAudioStream,
  enableVideo as restartVideoStream,
  disableAudio as stopAudioStream,
  disableVideo as stopVideoStream,
} from 'src/socket';

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

export type VideoCreateInputOptions = {
  video?: boolean;
  audio?: boolean;
  stream?: MediaStream; // for backend use
};

export type VideoConnectInputOptions = {
  signalData: any;
};

export type EnableVideoInputOptions = {
  state: boolean;
};

export type EnableAudioInputOptions = {
  state: boolean;
};

const getMediaStream = async () => {
  const devices = await mediaDevices.getUserMedia({
    audio: true,
    video: true,
  });

  if (Platform.OS === 'ios') {
    InCallManager.setForceSpeakerphoneOn(
      !InCallManager.getIsWiredHeadsetPluggedIn(),
    );
  } else if (Platform.OS === 'android') {
    InCallManager.setSpeakerphoneOn(true);
  }

  DeviceEventEmitter.addListener(
    'WiredHeadset',
    ({isPlugged, hasMic}: {isPlugged: boolean; hasMic: boolean}) => {
      console.log('WiredHeadset', isPlugged, hasMic);
      if (isPlugged && hasMic) {
        InCallManager.setForceSpeakerphoneOn(false);
      } else if (Platform.OS === 'ios') {
        InCallManager.setForceSpeakerphoneOn(!isPlugged);
      } else if (Platform.OS === 'android') {
        InCallManager.setSpeakerphoneOn(!isPlugged);
      }
    },
  );

  return devices;
};

const getIceServers = async () => {
  const apiUrl = envConfig.EPNS_SERVER + envConfig.ENDPOINT_ICE_SERVERS;
  const response = await fetch(apiUrl);
  const json = await response.json();
  return json;
};

export class Video {
  // user, call related info
  private signer = '';
  private chainId: number;
  private pgpPrivateKey: string;
  private env: ENV = envConfig.ENV as ENV;

  // storing the peer instance
  private peerInstance: any = null;

  private data: VideoCallData;
  setData: (fn: (data: VideoCallData) => VideoCallData) => void;

  constructor({
    pgpPrivateKey,
    setData,
  }: {
    pgpPrivateKey: string;
    setData: (fn: (data: VideoCallData) => VideoCallData) => void;
  }) {
    this.chainId = envConfig.CHAIN_ID;
    this.pgpPrivateKey = pgpPrivateKey;

    // init the react state
    setData(() => initVideoCallData);

    // init the class variable
    this.data = initVideoCallData;

    // set the state updating function
    this.setData = function (fn) {
      // update the react state
      setData(fn);

      // update the class variable
      this.data = fn(this.data);
    };
  }

  async create(options: VideoCreateInputOptions): Promise<void> {
    const {audio = true, video = true, stream = null} = options || {};
    try {
      const localStream = stream || (await getMediaStream());

      this.setData(oldData => {
        return produce(oldData, draft => {
          draft.local.stream = localStream;
          draft.local.video = video;
          draft.local.audio = audio;
        });
      });
    } catch (err) {
      console.log('error in create', err);
    }
  }

  async request(options: VideoRequestInputOptions): Promise<void> {
    const {
      senderAddress, // notification sender
      recipientAddress, // notification receiver
      chatId,
      onReceiveMessage = (message: string) => {
        console.log('received a message', message);
      },
      retry = false,
    } = options || {};

    try {
      console.log(
        'request',
        'options',
        options,
        'localStream',
        this.data.local.stream === null,
      );

      if (this.data.local.stream === null) {
        const stream = await getMediaStream();
        this.setData(oldData => {
          return produce(oldData, draft => {
            draft.local.stream = stream;
          });
        });
      }

      const iceServers = await getIceServers();
      this.peerInstance = new RNPeer({
        initiator: true,
        trickle: false,
        debugConsole: false,
        config: {
          iceServers: iceServers,
        },
        webRTC: {
          RTCPeerConnection,
          RTCIceCandidate,
          RTCSessionDescription,
        },
        stream: this.data.local.stream,
      });

      this.peerInstance.on('signal', (data: any) => {
        this.setData(oldData => {
          return produce(oldData, draft => {
            draft.meta.initiator.signal = data;
          });
        });

        // sending notification to the recipientAddress with video call signaling data
        sendVideoCallNotification(
          {
            signer: this.signer,
            chainId: this.chainId,
            pgpPrivateKey: this.pgpPrivateKey,
          },
          {
            senderAddress,
            recipientAddress,
            status: retry
              ? VideoCallStatus.RETRY_INITIALIZED
              : VideoCallStatus.INITIALIZED,
            chatId,
            signalData: data,
            env: this.env,
          },
        );
      });

      this.peerInstance.on('connect', () => {
        this.peerInstance.send(`initial message from ${senderAddress}`);
        this.peerInstance.send(
          JSON.stringify({
            type: 'isVideoOn',
            isVideoOn: this.data.local.video,
          }),
        );
        this.peerInstance.send(
          JSON.stringify({
            type: 'isAudioOn',
            isAudioOn: this.data.local.audio,
          }),
        );
      });

      this.peerInstance.on('data', (data: any) => {
        if (JsonHelper.isJSON(data)) {
          const parsedData = JSON.parse(data);
          if (parsedData.type === 'isVideoOn') {
            console.log('IS VIDEO ON', parsedData.isVideoOn);
            this.setData(oldData => {
              return produce(oldData, draft => {
                draft.incoming[0].video = parsedData.isVideoOn;
              });
            });
          }

          if (parsedData.type === 'isAudioOn') {
            console.log('IS AUDIO ON', parsedData.isAudioOn);
            this.setData(oldData => {
              return produce(oldData, draft => {
                draft.incoming[0].audio = parsedData.isAudioOn;
              });
            });
          }

          if (parsedData.type === 'endCall') {
            console.log('END CALL', parsedData.endCall);
            // destroy the local stream
            if (this.data.local.stream) {
              endStream(this.data.local.stream);
            }

            // reset the state
            this.setData(() => initVideoCallData);
          }
        } else {
          onReceiveMessage(data);
        }
      });

      this.peerInstance.on('stream', (currentStream: MediaStream) => {
        // console.log('------------STREAM RECEIVED------------');
        // if (
        //   currentStream.currentTarget &&
        //   currentStream.currentTarget._remoteStreams
        // ) {
        //   currentStream = currentStream.currentTarget._remoteStreams[0];
        // }
        console.log('received incoming stream');
        this.setData(oldData => {
          return produce(oldData, draft => {
            draft.incoming[0].stream = currentStream;
          });
        });
      });

      // set videoCallInfo state with status 1 (call initiated)
      this.setData(oldData => {
        return produce(oldData, draft => {
          draft.local.address = senderAddress;
          draft.incoming[0].address = recipientAddress;
          draft.meta.chatId = chatId;
          draft.meta.initiator.address = senderAddress;
          draft.incoming[0].status = retry
            ? VideoCallStatus.RETRY_INITIALIZED
            : VideoCallStatus.INITIALIZED;
          draft.incoming[0].retryCount += retry ? 1 : 0;
        });
      });
    } catch (err) {
      console.log('error in request', err);
    }
  }

  async acceptRequest(options: VideoAcceptRequestInputOptions): Promise<void> {
    const {
      signalData,
      senderAddress, // notification sender
      recipientAddress, // notification receiver
      chatId,
      onReceiveMessage = (message: string) => {
        console.log('received a message', message);
      },
      retry = false,
    } = options || {};

    try {
      console.log(
        'accept request',
        'options',
        {
          senderAddress,
          recipientAddress,
          chatId,
          retry,
        },
        'localStream',
        this.data.local.stream === null,
      );

      if (this.data.local.stream === null) {
        const stream = await getMediaStream();
        this.setData(oldData => {
          return produce(oldData, draft => {
            draft.local.stream = stream;
          });
        });
      }

      const iceServers = await getIceServers();
      this.peerInstance = new RNPeer({
        initiator: false,
        trickle: false,
        debugConsole: false,
        config: {
          iceServers: iceServers,
        },
        webRTC: {
          RTCPeerConnection,
          RTCIceCandidate,
          RTCSessionDescription,
        },
        stream: this.data.local.stream,
      });

      this.peerInstance.signal(signalData);

      this.peerInstance.on('signal', (data: any) => {
        this.setData(oldData => {
          return produce(oldData, draft => {
            draft.meta.initiator.signal = data;
          });
        });

        sendVideoCallNotification(
          {
            signer: this.signer,
            chainId: this.chainId,
            pgpPrivateKey: this.pgpPrivateKey,
          },
          {
            senderAddress,
            recipientAddress,
            status: retry
              ? VideoCallStatus.RETRY_RECEIVED
              : VideoCallStatus.RECEIVED,
            chatId,
            signalData: data,
            env: this.env,
          },
        );
      });

      this.peerInstance.on('connect', () => {
        this.peerInstance.send('initial message from receiver');
        this.peerInstance.send(
          JSON.stringify({
            type: 'isVideoOn',
            isVideoOn: this.data.local.video,
          }),
        );
        this.peerInstance.send(
          JSON.stringify({
            type: 'isAudioOn',
            isAudioOn: this.data.local.audio,
          }),
        );

        // set videoCallInfo state with status connected for the receiver's end
        this.setData(oldData => {
          return produce(oldData, draft => {
            draft.incoming[0].status = VideoCallStatus.CONNECTED;
          });
        });
      });

      this.peerInstance.on('data', (data: any) => {
        if (JsonHelper.isJSON(data)) {
          const parsedData = JSON.parse(data);
          if (parsedData.type === 'isVideoOn') {
            console.log('IS VIDEO ON', parsedData.isVideoOn);
            this.setData(oldData => {
              return produce(oldData, draft => {
                draft.incoming[0].video = parsedData.isVideoOn;
              });
            });
          }

          if (parsedData.type === 'isAudioOn') {
            console.log('IS AUDIO ON', parsedData.isAudioOn);
            this.setData(oldData => {
              return produce(oldData, draft => {
                draft.incoming[0].audio = parsedData.isAudioOn;
              });
            });
          }

          if (parsedData.type === 'endCall') {
            console.log('END CALL', parsedData.endCall);
            // destroy the local stream
            if (this.data.local.stream) {
              endStream(this.data.local.stream);
            }

            // reset the state
            this.setData(() => initVideoCallData);
          }
        } else {
          onReceiveMessage(data);
        }
      });

      this.peerInstance.on('stream', (currentStream: MediaStream) => {
        // console.log('------------STREAM RECEIVED------------');
        // if (
        //   currentStream.currentTarget &&
        //   currentStream.currentTarget._remoteStreams
        // ) {
        //   currentStream = currentStream.currentTarget._remoteStreams[0];
        // }

        console.log('received incoming stream', currentStream);
        this.setData(oldData => {
          return produce(oldData, draft => {
            draft.incoming[0].stream = currentStream;
          });
        });
      });

      // this.peerInstance.on('iceStateChange', (iceState: any) => {
      //   if (iceState === 'failed') {
      //     console.log('iceStateChange failed');
      //     console.log('retry Count was ', this.data.incoming[0].retryCount);
      //     this.errorInAcceptRequest(options);
      //   }
      // });

      // set videoCallInfo state with status 2 (call received)
      this.setData(oldData => {
        return produce(oldData, draft => {
          draft.local.address = senderAddress;
          draft.incoming[0].address = recipientAddress;
          draft.meta.chatId = chatId;
          draft.meta.initiator.address = senderAddress;
          draft.incoming[0].status = retry
            ? VideoCallStatus.RETRY_RECEIVED
            : VideoCallStatus.RECEIVED;
          draft.incoming[0].retryCount += retry ? 1 : 0;
        });
      });
    } catch (err) {
      console.log('iceStateChange failed in catch', err);
      // this.errorInAcceptRequest(options);
    }
  }

  async errorInAcceptRequest(
    options: VideoAcceptRequestInputOptions,
  ): Promise<void> {
    const {senderAddress, recipientAddress, chatId} = options;

    console.log('error in accept request');

    if (this.data.incoming[0].retryCount >= 5) {
      console.log('Max retries exceeded, please try again.');
      this.disconnect();
    }

    // retrying in case of connection error
    await sendVideoCallNotification(
      {
        signer: this.signer,
        chainId: this.chainId,
        pgpPrivateKey: this.pgpPrivateKey,
      },
      {
        senderAddress,
        recipientAddress,
        status: VideoCallStatus.RETRY_INITIALIZED,
        chatId,
        signalData: null,
        env: this.env,
      },
    );
  }

  connect(options: VideoConnectInputOptions): void {
    const {signalData} = options || {};

    try {
      this.peerInstance?.signal(signalData);

      // set videoCallInfo state with status connected for the caller's end
      this.setData(oldData => {
        return produce(oldData, draft => {
          draft.incoming[0].status = VideoCallStatus.CONNECTED;
        });
      });
    } catch (err) {
      //   console.log('error in connect', err);
      //   if (this.data.incoming[0].retryCount >= 5) {
      //     console.log('Max retries exceeded, please try again.');
      //     this.disconnect();
      //   }
      //   // retrying in case of connection error
      //   this.request({
      //     senderAddress: this.data.local.address,
      //     recipientAddress: this.data.incoming[0].address,
      //     chatId: this.data.meta.chatId,
      //     retry: true,
      //   });
    }
  }

  disconnect(): void {
    try {
      console.log('disconnect', 'status', this.data.incoming[0].status);
      if (this.data.incoming[0].status === VideoCallStatus.CONNECTED) {
        this.peerInstance?.send(
          JSON.stringify({type: 'endCall', endCall: true}),
        );
        this.peerInstance?.destroy();
      } else {
        // for disconnecting during status INITIALIZED, RECEIVED, RETRY_INITIALIZED, RETRY_RECEIVED
        // send a notif to the other user signaling status = DISCONNECTED
        sendVideoCallNotification(
          {
            signer: this.signer,
            chainId: this.chainId,
            pgpPrivateKey: this.pgpPrivateKey,
          },
          {
            senderAddress: this.data.local.address,
            recipientAddress: this.data.incoming[0].address,
            status: VideoCallStatus.DISCONNECTED,
            chatId: this.data.meta.chatId,
            signalData: null,
            env: this.env,
          },
        );
      }

      // destroy the local stream
      if (this.data.local.stream) {
        endStream(this.data.local.stream);
      }

      // reset the state
      this.setData(() => initVideoCallData);
    } catch (err) {
      console.log('error in disconnect', err);
    }
  }

  // functions for enabling/disabling local audio and video

  enableVideo(options: EnableVideoInputOptions): void {
    const {state} = options || {};

    if (this.data.local.video !== state) {
      // need to change the video state

      if (this.data.incoming[0].status === VideoCallStatus.CONNECTED) {
        this.peerInstance?.send(
          JSON.stringify({
            type: 'isVideoOn',
            isVideoOn: state,
          }),
        );
      }
      if (this.data.local.stream) {
        this.setData(oldData => {
          return produce(oldData, draft => {
            draft.local.video = state;
          });
        });
        if (state) {
          restartVideoStream(this.data.local.stream);
        } else {
          stopVideoStream(this.data.local.stream);
        }
      }
    }
  }

  enableAudio(options: EnableAudioInputOptions): void {
    const {state} = options || {};

    if (this.data.local.audio !== state) {
      // need to change the audio state

      if (this.data.incoming[0].status === VideoCallStatus.CONNECTED) {
        this.peerInstance?.send(
          JSON.stringify({type: 'isAudioOn', isAudioOn: state}),
        );
      }
      if (this.data.local.stream) {
        this.setData(oldData => {
          return produce(oldData, draft => {
            draft.local.audio = state;
          });
        });
        if (state) {
          console.log('restarting audio stream');
          restartAudioStream(this.data.local.stream);
        } else {
          console.log('stopping audio stream');
          stopAudioStream(this.data.local.stream);
        }
      }
    }
  }

  // helper functions

  isInitiator(): boolean {
    console.log('Checking if initiator', {
      initiator: this.data.meta.initiator.address,
      local: this.data.local.address,
    });
    if (
      this.data.meta.initiator.address === '' ||
      this.data.local.address === ''
    ) {
      return false;
    }

    return this.data.meta.initiator.address === this.data.local.address;
  }
}
