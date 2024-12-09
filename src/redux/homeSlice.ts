import {PayloadAction, createSlice} from '@reduxjs/toolkit';

export type ChannelInboxNotificationAcknowledgement = {
  notificationReceived?: boolean;
  notificationOpened?: boolean;
};

type HomeInitialState = {
  channelInboxNotificationAcknowledgement: ChannelInboxNotificationAcknowledgement;
};

type ReturnTypeHome = {home: HomeInitialState};

const initialState: HomeInitialState = {
  channelInboxNotificationAcknowledgement: {
    notificationReceived: false,
    notificationOpened: false,
  },
};

const homeSlice = createSlice({
  name: 'home',
  initialState,
  reducers: {
    updateInboxNotificationAcknowledgement: (
      state,
      action: PayloadAction<ChannelInboxNotificationAcknowledgement>,
    ) => {
      state.channelInboxNotificationAcknowledgement = {
        ...state.channelInboxNotificationAcknowledgement,
        ...action.payload,
      };
    },
  },
});

export const {updateInboxNotificationAcknowledgement} = homeSlice.actions;

export const selectInboxNotificationAcknowledgement = (state: ReturnTypeHome) =>
  state.home.channelInboxNotificationAcknowledgement;

export default homeSlice.reducer;
