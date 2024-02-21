import {IFeeds} from '@pushprotocol/restapi';

import {ChatFeedCache} from './useChatLoader';

export const checkIfItemInCache = (cache: ChatFeedCache, feeds: IFeeds[]) => {
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
  feeds: IFeeds[],
) => {
  const chatFeeds: IFeeds[] = [];
  const requestFeeds: IFeeds[] = [];

  feeds.forEach(element => {
    if (element.intent?.includes(userAddress)) {
      chatFeeds.push(element);
    } else {
      requestFeeds.push(element);
    }
  });
  return [chatFeeds, requestFeeds];
};
