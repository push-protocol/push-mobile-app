import {createSlice} from '@reduxjs/toolkit';
import {RTCView} from 'react-native-webrtc';

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
} = videoSlice.actions;

export default videoSlice.reducer;
