import EncryptedStorage from 'react-native-encrypted-storage';

import {STORAGE_CONSTANTS} from '../constants';
import {ChatData} from './useChatLoader';

export const persistChatData = async (payload: ChatData): Promise<void> => {
  try {
    await EncryptedStorage.setItem(
      STORAGE_CONSTANTS.CHAT_DATA,
      JSON.stringify(payload),
    );
  } catch (error) {
    console.error(error);
  }
};

export const getPersistedChatData = async (): Promise<ChatData | null> => {
  try {
    const data = await EncryptedStorage.getItem(STORAGE_CONSTANTS.CHAT_DATA);

    if (data == null) {
      return null;
    }

    return JSON.parse(data);
  } catch (error) {
    console.error(error);

    return null;
  }
};

const LATEST_HASH = 'LATEST_HASH';
export const getStoredConversationData = async (chatId: string) => {
  try {
    const cachedData = await EncryptedStorage.getItem(
      `${STORAGE_CONSTANTS.PRIVATE_CHAT}-${chatId}`,
    );

    const latestHash = await EncryptedStorage.getItem(
      `${STORAGE_CONSTANTS.PRIVATE_CHAT}-${chatId}-${LATEST_HASH}`,
    );

    if (!cachedData) {
      return [null, null];
    }

    if (!latestHash) {
      return [null, null];
    }

    return [JSON.parse(cachedData), latestHash];
  } catch (error) {
    console.error(error);

    return [null, null];
  }
};

export const storeConversationData = async (
  chatId: string,
  latestHash: string,
  payload: any | any[],
): Promise<void> => {
  try {
    const [cachedData, lastHash] = await getStoredConversationData(chatId);

    // when cache is empty store all and return
    if (cachedData === null || lastHash === null) {
      await EncryptedStorage.setItem(
        `${STORAGE_CONSTANTS.PRIVATE_CHAT}-${chatId}-${LATEST_HASH}`,
        latestHash,
      );

      if (Array.isArray(payload)) {
        await EncryptedStorage.setItem(
          `${STORAGE_CONSTANTS.PRIVATE_CHAT}-${chatId}`,
          JSON.stringify(payload),
        );
      } else {
        await EncryptedStorage.setItem(
          `${STORAGE_CONSTANTS.PRIVATE_CHAT}-${chatId}`,
          JSON.stringify([payload]),
        );
      }

      return;
    }

    // if data is on the cache no need to store
    if (latestHash === lastHash) {
      return;
    }
    console.log('caching....', latestHash);

    // append new chats
    let parsedData = cachedData;
    parsedData = parsedData.concat(payload);

    await EncryptedStorage.setItem(
      `${STORAGE_CONSTANTS.PRIVATE_CHAT}-${combined_did}`,
      JSON.stringify(parsedData),
    );

    await EncryptedStorage.setItem(
      `${STORAGE_CONSTANTS.PRIVATE_CHAT}-${combined_did}-${LATEST_HASH}`,
      latestHash,
    );
  } catch (error) {
    console.error('Error storing to cache', error);
  }
};

export const clearStorage = async () => {
  try {
    await EncryptedStorage.clear();
  } catch (error) {
    console.error(error);
  }
};

export const storeLastMessageHash = async () => {
  try {
  } catch (error) {
    console.error(error);
  }
};

export const getLastMessageHash = async () => {
  try {
  } catch (error) {
    console.error(error);
  }
};
