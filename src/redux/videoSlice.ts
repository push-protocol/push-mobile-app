import {createSlice} from '@reduxjs/toolkit';

export interface VideoCallStatus {
  isReceivingCall: boolean;
}

const initialState: VideoCallStatus = {
  isReceivingCall: false,
};

const videoSlice = createSlice({
  name: 'video',
  initialState,
  reducers: {
    setIsReceivingCall: (state, action) => {
      state.isReceivingCall = action.payload;
    },
  },
});

export const {setIsReceivingCall} = videoSlice.actions;

export const selectVideoCall = (state: {video: VideoCallStatus}) => state.video;

export default videoSlice.reducer;
