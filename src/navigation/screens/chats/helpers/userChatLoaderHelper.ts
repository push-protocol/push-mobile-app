import * as PushNodeClient from 'src/apis';

import {ChatFeedCache} from './useChatLoader';

export const checkIfItemInCache = (
  cache: ChatFeedCache,
  feeds: PushNodeClient.Feeds[],
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
  feeds: PushNodeClient.Feeds[],
) => {
  const chatFeeds: PushNodeClient.Feeds[] = [];
  const requestFeeds: PushNodeClient.Feeds[] = [];

  feeds.forEach(element => {
    if (element.intent?.includes(userAddress)) {
      chatFeeds.push(element);
    } else {
      requestFeeds.push(element);
    }
  });
  return [chatFeeds, requestFeeds];
};
