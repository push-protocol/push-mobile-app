import {PayloadAction, createSlice} from '@reduxjs/toolkit';

export type notificationSubTypes =
  | 'inbox'
  | 'spam'
  | 'singleChat'
  | 'groupChat';

export type NotificationAlertType = {
  screen: string;
  type: notificationSubTypes;
};

type AppInitialState = {
  notificationAlert: NotificationAlertType | null;
};

const initialState: AppInitialState = {
  notificationAlert: null,
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setNotificationAlert: (
      state,
      action: PayloadAction<NotificationAlertType>,
    ) => {
      state.notificationAlert = action.payload;
    },
  },
});

export const {setNotificationAlert} = appSlice.actions;

type ReturnTypeChannel = {app: AppInitialState};
export const selectNotificationAlert = (state: ReturnTypeChannel) =>
  state.app.notificationAlert;

export default appSlice.reducer;
