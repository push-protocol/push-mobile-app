import AsyncStorage from '@react-native-async-storage/async-storage';
import {Cache} from 'react-native-cache';

const cache = new Cache({
  namespace: 'push',
  policy: {
    // if unspecified, it can have unlimited entries
    // set a value to avoid memory bloating
    maxEntries: 50000,
    // 24 hours in seconds, set it to 0 for infinite
    stdTTL: 24 * 60 * 60,
  },
  backend: AsyncStorage,
});

export const CacheHelper = {
  setItem: async (key: string, value: string) => {
    await cache.set(key, value);
  },

  getItem: async (key: string) => {
    return await cache.get(key);
  },

  getAllItems: async () => {
    return await cache.getAll();
  },

  removeItem: async (key: string) => {
    await cache.remove(key);
  },

  clear: async () => {
    await cache.clearAll();
  },
};
