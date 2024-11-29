import AsyncStorage from '@react-native-async-storage/async-storage';
import {configureStore} from '@reduxjs/toolkit';
import {combineReducers} from 'redux';
import {
  FLUSH,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
  REHYDRATE,
  persistReducer,
} from 'redux-persist';

import appSlice from './appSlice';
import authSlice from './authSlice';
import channelSlice from './channelSlice';
import feedSlice from './feedSlice';
import modalSlice from './modalSlice';
import videoSlice from './videoSlice';

const persistConfig = {
  key: 'root',
  version: 1,
  storage: AsyncStorage,
  whitelist: ['feed', 'auth'],
  blacklist: ['video', 'channel', 'modal'],
};

const rootReducer = combineReducers({
  app: appSlice,
  auth: authSlice,
  feed: feedSlice,
  video: videoSlice,
  channel: channelSlice,
  modal: modalSlice,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export default store;
