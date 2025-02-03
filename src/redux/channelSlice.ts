import {PayloadAction, createSlice} from '@reduxjs/toolkit';
import {ChannelPendingSubscriptionType} from 'src/components/buttons/SubscriptionStatus';
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
  subscriptions: SubscriptionsMapping;
  isLoadingSubscriptions: boolean;
  channelPendingSubscription: ChannelPendingSubscriptionType;
};

const initialState: ChannelSliceData = {
  channels: [],
  subscriptions: {},
  isLoadingSubscriptions: false,
  channelPendingSubscription: {
    channel_id: null,
    status: false,
  },
};

const channelSlice = createSlice({
  name: 'channel',
  initialState,
  reducers: {
    addChannels: (state, action) => {
      state.channels = [...state.channels, ...action.payload];
    },
    setChannels: (state, action) => {
      state.channels = action.payload;
    },
    resetChannels: state => {
      state.channels = [];
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
    setChannelPendingSubscription: (
      state,
      action: PayloadAction<ChannelPendingSubscriptionType>,
    ) => {
      state.channelPendingSubscription = action.payload;
    },
  },
});

export const {
  addChannels,
  setChannels,
  resetChannels,
  addChannelSubscription,
  removeChannelSubscription,
  setSubscriptions,
  setLoadingSubscriptions,
  setChannelPendingSubscription,
} = channelSlice.actions;

type ReturnTypeChannel = {channel: ChannelSliceData};
export const selectChannels = (state: ReturnTypeChannel) =>
  state.channel.channels;
export const selectChannel = (index: number) => (state: ReturnTypeChannel) =>
  state.channel.channels[index];
export const selectSubscriptions = (state: ReturnTypeChannel) =>
  state.channel.subscriptions;
export const selectIsLoadingSubscriptions = (state: ReturnTypeChannel) =>
  state.channel.isLoadingSubscriptions;
export const selectChannelPendingSubscription = (state: ReturnTypeChannel) =>
  state.channel.channelPendingSubscription;

export default channelSlice.reducer;
