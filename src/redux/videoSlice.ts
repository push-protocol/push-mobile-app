import {EVENTS, createSocketConnection} from '@pushprotocol/socket';
import {createSlice} from '@reduxjs/toolkit';
import {RTCView} from 'react-native-webrtc';

import {SocketConfig} from '../navigation/screens/chats/helpers/socketHelper';

export interface VideoCallState {
  callAccepted: boolean;
  callEnded: boolean;
  receiverPeerSignalled: boolean;
  localStream: React.LegacyRef<RTCView>;
  name: string;
  call: Call;
  me: string;
  isVideoOn: boolean;
  isAudioOn: boolean;
  incomingVideoOn: boolean;
  incomingAudioOn: boolean;
}

interface Call {
  isReceivingCall: boolean;
  from: string | null;
  name: string | null;
  signal: any;
}

const initialState: VideoCallState = {
  callAccepted: false,
  callEnded: false,
  receiverPeerSignalled: false,
  localStream: null,
  name: 'Joe',
  call: {
    isReceivingCall: false,
    from: null,
    name: null,
    signal: null,
  },
  me: '',
  isVideoOn: true,
  isAudioOn: true,
  incomingVideoOn: true,
  incomingAudioOn: true,
};

const videoSlice = createSlice({
  name: 'video',
  initialState,
  reducers: {
    setCallAccepted: (state, action) => {
      state.callAccepted = action.payload;
    },
    setCallEnded: (state, action) => {
      state.callEnded = action.payload;
    },
    setReceiverPeerSignalled: (state, action) => {
      state.receiverPeerSignalled = action.payload;
    },
    setLocalStream: (state, action) => {
      state.localStream = action.payload;
    },
    setName: (state, action) => {
      state.name = action.payload;
    },
    setCall: (state, action) => {
      state.call = action.payload;
    },
    setMe: (state, action) => {
      state.me = action.payload;
    },
    setIsVideoOn: (state, action) => {
      state.isVideoOn = action.payload;
    },
    setIsAudioOn: (state, action) => {
      state.isAudioOn = action.payload;
    },
    setIncomingVideoOn: (state, action) => {
      state.incomingVideoOn = action.payload;
    },
    setIncomingAudioOn: (state, action) => {
      state.incomingAudioOn = action.payload;
    },
    toggleIsVideoOn: state => {
      state.isVideoOn = !state.isVideoOn;
    },
    toggleIsAudioOn: state => {
      state.isAudioOn = !state.isAudioOn;
    },
  },
});

export const {
  setCallAccepted,
  setCallEnded,
  setReceiverPeerSignalled,
  setLocalStream,
  setName,
  setCall,
  setMe,
  setIsVideoOn,
  setIsAudioOn,
  setIncomingVideoOn,
  setIncomingAudioOn,
  toggleIsVideoOn,
  toggleIsAudioOn,
} = videoSlice.actions;

export const selectVideoCall = (state: any) => state.video;

export default videoSlice.reducer;

const enableAudio = (stream: any) => {
  stream.getAudioTracks().forEach((track: any) => (track.enabled = true));
};

const disableAudio = (stream: any) => {
  stream.getAudioTracks().forEach((track: any) => (track.enabled = false));
};

const enableVideo = (stream: any) => {
  stream.getVideoTracks().forEach((track: any) => (track.enabled = true));
};

const disableVideo = (stream: any) => {
  stream.getVideoTracks().forEach((track: any) => (track.enabled = false));
};

const toggleCamera = (stream: any) => {
  stream.getVideoTracks().forEach((track: any) => {
    track._switchCamera();
  });
};

const handleIncomingCall = (videoMeta: any) => {
  console.log('handleIncomingCall', videoMeta);
};
const handleAcceptCall = (videoMeta: any) => {
  console.log('handleAcceptCall', videoMeta);
};

const setupGlobalSocket = (userAddress: string) => {
  console.log('setupGlobalSocket');

  const socket = createSocketConnection({
    env: SocketConfig.url,
    user: userAddress,
    apiKey: SocketConfig.key,
    socketType: 'notification',
    socketOptions: {autoConnect: true, reconnectionAttempts: 3},
  });

  if (!socket) {
    console.log('Socket not initialized properly!');
    return null;
  }

  socket.on('connect', () => {
    console.log('Connected to video socket');
  });

  socket.on('disconnect', () => {
    console.log('Disconnected from video socket');
  });

  socket.on(EVENTS.USER_FEEDS, (feedItem: any) => {
    console.log('feedItem', feedItem);
    try {
      const {payload} = feedItem || {};
      // if video meta, skip notification
      if (
        payload.hasOwnProperty('data') &&
        payload.data.hasOwnProperty('videoMeta')
      ) {
        const videoMeta = JSON.parse(payload.data.videoMeta);
        console.log('Call feed', videoMeta);
        console.log('Call feed status', videoMeta.status);
        console.log('Status Type', typeof videoMeta.status);
        if (videoMeta.status === 1) {
          // incoming call received, do something with it
          handleIncomingCall(videoMeta);
        } else if (videoMeta.status === 2) {
          handleAcceptCall(videoMeta);
        }
      }
    } catch (e) {
      console.error('Notification error: ', e);
    }
  });

  return socket;
};

export {
  enableAudio,
  disableAudio,
  enableVideo,
  disableVideo,
  toggleCamera,
  setupGlobalSocket,
};
