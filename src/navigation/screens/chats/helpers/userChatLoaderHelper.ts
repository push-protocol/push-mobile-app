import * as PushSdk from '@kalashshah/react-native-sdk/src';

import {ChatFeedCache} from './useChatLoader';

export const checkIfItemInCache = (
  cache: ChatFeedCache,
  feeds: PushSdk.PushApi.IFeeds[],
) => {
  let isInCache = true;
  for (let i = 0; i < feeds.length; i++) {
    const {threadhash, combinedDID} = feeds[i];

    // update cache
    if (!cache[combinedDID] || threadhash !== cache[combinedDID]) {
      isInCache = false;
      cache[combinedDID] = threadhash!;
    }
  }
  return isInCache;
};

export const filterChatAndRequestFeeds = (
  userAddress: string,
  feeds: PushSdk.PushApi.IFeeds[],
) => {
  const chatFeeds: PushSdk.PushApi.IFeeds[] = [];
  const requestFeeds: PushSdk.PushApi.IFeeds[] = [];

  feeds.forEach(element => {
    if (element.intent?.includes(userAddress)) {
      chatFeeds.push(element);
    } else {
      requestFeeds.push(element);
    }
  });
  return [chatFeeds, requestFeeds];
};
