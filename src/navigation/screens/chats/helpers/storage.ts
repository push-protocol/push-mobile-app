import AsyncStorage from '@react-native-async-storage/async-storage';

import {CACHE_LIMIT, STORAGE_CONSTANTS} from '../constants';
import {ChatData} from './useChatLoader';

export const persistChatData = async (payload: ChatData): Promise<void> => {
  try {
    await AsyncStorage.setItem(
      STORAGE_CONSTANTS.CHAT_DATA,
      JSON.stringify(payload),
    );
  } catch (error) {
    console.error(error);
  }
};

export const getPersistedChatData = async (): Promise<ChatData | null> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_CONSTANTS.CHAT_DATA);

    if (data == null) {
      return null;
    }

    return JSON.parse(data);
  } catch (error) {
    console.error(error);

    return null;
  }
};

export const getStoredConversationData = async (
  userAddress: string,
): Promise<any | null> => {
  try {
    const cachedData = await AsyncStorage.getItem(
      `${STORAGE_CONSTANTS.PRIVATE_CHAT}-${userAddress}`,
    );

    if (cachedData == null) {
      return null;
    }

    return JSON.parse(cachedData);
  } catch (error) {
    console.error(error);

    return null;
  }
};

export const storeConversationData = async (
  userAddress: string,
  payload: any,
): Promise<void> => {
  try {
    const cachedData = await getStoredConversationData(userAddress);

    if (cachedData == null) {
      await AsyncStorage.setItem(
        `${STORAGE_CONSTANTS.PRIVATE_CHAT}-${userAddress}`,
        JSON.stringify([payload]),
      );

      return;
    }

    const parsedData = JSON.parse(cachedData);

    parsedData.push(payload);

    await AsyncStorage.setItem(
      `${STORAGE_CONSTANTS.PRIVATE_CHAT}-${userAddress}`,
      JSON.stringify(parsedData.slice(-CACHE_LIMIT)),
    );
  } catch (error) {
    console.error(error);
  }
};
