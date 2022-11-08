import EncryptedStorage from 'react-native-encrypted-storage';

import {CACHE_LIMIT, STORAGE_CONSTANTS} from '../constants';
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
export const getStoredConversationData = async (userAddress: string) => {
  try {
    console.log('this one passed');

    const cachedData = await EncryptedStorage.getItem(
      `${STORAGE_CONSTANTS.PRIVATE_CHAT}-${userAddress}`,
    );

    console.log('chelsea', cachedData?.length);

    const latestHash = await EncryptedStorage.getItem(
      `${STORAGE_CONSTANTS.PRIVATE_CHAT}-${LATEST_HASH}`,
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
  userAddress: string,
  latestHash: string,
  payload: any | any[],
): Promise<void> => {
  try {
    const [cachedData, lastHash] = await getStoredConversationData(userAddress);

    // when cache is empty
    if (cachedData === null || lastHash === null) {
      await EncryptedStorage.setItem(
        `${STORAGE_CONSTANTS.PRIVATE_CHAT}-${LATEST_HASH}`,
        latestHash,
      );

      if (Array.isArray(payload)) {
        await EncryptedStorage.setItem(
          `${STORAGE_CONSTANTS.PRIVATE_CHAT}-${userAddress}`,
          JSON.stringify(payload),
        );
      } else {
        await EncryptedStorage.setItem(
          `${STORAGE_CONSTANTS.PRIVATE_CHAT}-${userAddress}`,
          JSON.stringify([payload]),
        );
      }

      return;
    }

    // if data is on the cache no need to store
    if (latestHash === lastHash) {
      return;
    }
    console.log('storing to cache');

    // store new chats
    let parsedData = JSON.parse(cachedData);
    if (Array.isArray(payload)) {
      parsedData = parsedData.concat(payload);
    } else {
      parsedData.push(payload);
    }
    await EncryptedStorage.setItem(
      `${STORAGE_CONSTANTS.PRIVATE_CHAT}-${userAddress}`,
      JSON.stringify(parsedData.slice(-CACHE_LIMIT)),
    );

    await EncryptedStorage.setItem(
      `${STORAGE_CONSTANTS.PRIVATE_CHAT}-${LATEST_HASH}`,
      lastHash,
    );
  } catch (error) {
    console.error(error);
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
