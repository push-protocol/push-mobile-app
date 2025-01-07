import {useEffect, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import Globals from 'src/Globals';
import GLOBALS from 'src/Globals';
import {usePushApi} from 'src/contexts/PushApiContext';
import envConfig from 'src/env.config';
import {
  addChannels,
  nextChannelsPage,
  resetChannels,
  selectChannelsPage,
  selectChannelsReachedEnd,
  setChannelsPage,
  setChannelsReachedEnd,
} from 'src/redux/channelSlice';

export type UseChannelsProps = {
  tag: string;
};

const useChannels = ({tag}: UseChannelsProps) => {
  const [isLoadingChannels, setChannelsLoading] = useState<boolean>(false);
  const [isLoadingSearchResults, setSearchResultsLoading] =
    useState<boolean>(false);
  const [searchResults, setSearchResults] = useState([]);
  const {userPushSDKInstance} = usePushApi();

  const dispatch = useDispatch();

  const channelsPage = useSelector(selectChannelsPage);
  const channelsReachedEnd = useSelector(selectChannelsReachedEnd);

  useEffect(() => {
    if (!channelsReachedEnd && !isLoadingChannels && channelsPage !== 0) {
      loadChannels({page: channelsPage});
    }
  }, [channelsPage]);

  useEffect(() => {
    if (tag) {
      dispatch(setChannelsPage(1));
      dispatch(resetChannels());
      loadChannels({page: 1});
    }
  }, [tag]);

  const loadMoreChannels = () => {
    if (channelsReachedEnd || isLoadingChannels) return;
    dispatch(nextChannelsPage());
  };

  const loadChannels = async ({page}: {page: number}) => {
    // If we have reached the end of the channels or loading, do nothing
    if (channelsReachedEnd || isLoadingChannels) return;
    setChannelsLoading(true);
    try {
      console.log('Call channel API');
      const apiURL = envConfig.EPNS_SERVER + envConfig.ENDPOINT_FETCH_CHANNELS;
      let requestURL = `${apiURL}?limit=${GLOBALS.CONSTANTS.FEED_ITEMS_TO_PULL}&page=${page}`;
      if (tag.length > 0 && tag !== Globals.CONSTANTS.ALL_CATEGORIES) {
        requestURL = `${requestURL}&tag=${tag}`;
      }
      console.log(requestURL);
      const resJson = await fetch(requestURL).then(response => response.json());
      if (resJson.channels.length !== 0) {
        dispatch(addChannels(resJson.channels));
        dispatch(setChannelsReachedEnd(false));
      } else if (resJson.channels.length === 0) {
        dispatch(setChannelsReachedEnd(true));
      }
    } catch (e) {
      console.log('Error', JSON.stringify(e));
    } finally {
      setChannelsLoading(false);
    }
  };

  const loadSearchResults = async (query: string) => {
    setSearchResultsLoading(true);
    try {
      const results = await userPushSDKInstance?.channel.search(query, {
        page: 1,
        limit: GLOBALS.CONSTANTS.FEED_ITEMS_TO_PULL,
        tag,
      });
      setSearchResults(results);
    } catch (e) {
      console.error(e);
    } finally {
      setSearchResultsLoading(false);
    }
  };

  return {
    loadMoreChannels,
    loadSearchResults,
    isLoadingChannels,
    isLoadingSearchResults,
    searchResults,
  };
};

export default useChannels;
