import {PayloadAction, createSlice} from '@reduxjs/toolkit';

type HomeInitialState = {
  notificationReceived: boolean;
  notificationOpened: boolean;
};

type ReturnTypeHome = {home: HomeInitialState};

const initialState: HomeInitialState = {
  notificationReceived: false,
  notificationOpened: false,
};

const homeSlice = createSlice({
  name: 'home',
  initialState,
  reducers: {
    updateNotificationReceived: (state, action: PayloadAction<boolean>) => {
      state.notificationReceived = action.payload;
    },
    updateNotificationOpened: (state, action: PayloadAction<boolean>) => {
      state.notificationOpened = action.payload;
    },
  },
});

export const {updateNotificationReceived, updateNotificationOpened} =
  homeSlice.actions;

export const selectNotificationReceived = (state: ReturnTypeHome) =>
  state.home.notificationReceived;
export const selectNotificationOpened = (state: ReturnTypeHome) =>
  state.home.notificationOpened;

export default homeSlice.reducer;
