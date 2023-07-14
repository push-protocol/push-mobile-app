import {createSlice} from '@reduxjs/toolkit';

export interface VideoCallStatus {
  isReceivingCall: boolean;
  otherUserProfilePicture?: string;
}

const initialState: VideoCallStatus = {
  isReceivingCall: false,
  otherUserProfilePicture: undefined,
};

const videoSlice = createSlice({
  name: 'video',
  initialState,
  reducers: {
    setIsReceivingCall: (state, action) => {
      state.isReceivingCall = action.payload;
    },
    setOtherUserProfilePicture: (state, action) => {
      state.otherUserProfilePicture = action.payload;
    },
  },
});

export const {setIsReceivingCall, setOtherUserProfilePicture} =
  videoSlice.actions;

export const selectVideoCall = (state: {video: VideoCallStatus}) => state.video;

export default videoSlice.reducer;
