import {PayloadAction, createSlice} from '@reduxjs/toolkit';
import {
  ChannelSetting,
  UserSetting,
} from 'src/components/sheets/NFSettingSheet';

export type Channel = {
  name: string;
  icon: string;
  subscriber_count: number;
  channel: string;
  itemcount: number;
  processed: number;
  timestamp: string;
  url: string;
  info: string;
  verified_status: 0 | 1;
  alias_blockchain_id: null | string;
  channel_settings: null | string;
};

interface ISubscription {
  channel: string;
  user_settings: UserSetting[] | null;
}

export type SubscriptionsMapping = {[key: string]: ISubscription | undefined};

type ChannelSliceData = {
  channels: Array<Channel>;
  channelsPage: number;
  channelsReachedEnd: boolean;

  subscriptions: SubscriptionsMapping;
  isLoadingSubscriptions: boolean;
};

const initialState: ChannelSliceData = {
  channels: [],
  channelsPage: 0,
  channelsReachedEnd: false,
  subscriptions: {},
  isLoadingSubscriptions: false,
};

const channelSlice = createSlice({
  name: 'channel',
  initialState,
  reducers: {
    addChannels: (state, action) => {
      state.channels = [...state.channels, ...action.payload];
    },
    removeChannelSubscription: (
      state,
      action: PayloadAction<{channel: string}>,
    ) => {
      delete state.subscriptions[action.payload.channel];
    },
    addChannelSubscription: (state, action: PayloadAction<ISubscription>) => {
      state.subscriptions[action.payload.channel] = action.payload;
    },
    setSubscriptions: (state, action: PayloadAction<SubscriptionsMapping>) => {
      state.subscriptions = action.payload;
    },
    setLoadingSubscriptions: (state, action: PayloadAction<boolean>) => {
      state.isLoadingSubscriptions = action.payload;
    },
    setChannelsPage: (state, action: PayloadAction<number>) => {
      state.channelsPage = action.payload;
    },
    nextChannelsPage: state => {
      state.channelsPage += 1;
    },
    setChannelsReachedEnd: (state, action: PayloadAction<boolean>) => {
      state.channelsReachedEnd = action.payload;
    },
  },
});

export const {
  addChannels,
  setChannelsPage,
  setChannelsReachedEnd,
  addChannelSubscription,
  removeChannelSubscription,
  setSubscriptions,
  setLoadingSubscriptions,
  nextChannelsPage,
} = channelSlice.actions;

type ReturnTypeChannel = {channel: ChannelSliceData};
export const selectChannels = (state: ReturnTypeChannel) =>
  state.channel.channels;
export const selectChannel = (index: number) => (state: ReturnTypeChannel) =>
  state.channel.channels[index];
export const selectSubscriptions = (state: ReturnTypeChannel) =>
  state.channel.subscriptions;
export const selectChannelsReachedEnd = (state: ReturnTypeChannel) =>
  state.channel.channelsReachedEnd;
export const selectChannelsPage = (state: ReturnTypeChannel) =>
  state.channel.channelsPage;
export const selectIsLoadingSubscriptions = (state: ReturnTypeChannel) =>
  state.channel.isLoadingSubscriptions;

export default channelSlice.reducer;
