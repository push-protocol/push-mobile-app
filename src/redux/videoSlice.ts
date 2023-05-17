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

export interface Call {
  isReceivingCall: boolean;
  calling: boolean;
  from: string | null;
  to: string | null;
  name: string | null;
  chatId: string;
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
    calling: false,
    from: null,
    name: null,
    signal: null,
    to: null,
    chatId: '',
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

export const selectVideoCall = (state: {video: VideoCallState}) => state.video;

export default videoSlice.reducer;
