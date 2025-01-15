import {useEffect, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import Globals from 'src/Globals';
import GLOBALS from 'src/Globals';
import {usePushApi} from 'src/contexts/PushApiContext';
import envConfig from 'src/env.config';
import {addChannels, resetChannels, setChannels} from 'src/redux/channelSlice';

export type UseChannelsProps = {
  tag: string;
  searchQuery: string;
};

const DEBOUNCE_TIMEOUT = 500; //time in millisecond which we want to wait for then to finish typing

const useChannels = ({tag, searchQuery}: UseChannelsProps) => {
  const [searchTimer, setSearchTimer] = useState<NodeJS.Timeout>();
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isEndReached, setIsEndReached] = useState(false); // this confirms that all data is loaded

  const {userPushSDKInstance} = usePushApi();

  const dispatch = useDispatch();

  useEffect(() => {
    console.log('first', {page, tag, searchQuery});
    handleChannelInterval();
  }, [page, tag, searchQuery]);

  const handleChannelInterval = () => {
    if (searchTimer) {
      clearTimeout(searchTimer);
    }
    setSearchTimer(
      setTimeout(() => {
        getChannelsData();
      }, DEBOUNCE_TIMEOUT),
    );
  };

  const getChannelsData = () => {
    console.log('second', {page, tag, searchQuery});
    if (searchQuery.trim().length) {
      handleSearchAPI();
    } else {
      handleChannelAPI();
    }
  };

  const loadMore = () => {
    if (!isEndReached && !isLoading && !isLoadingMore) {
      setIsLoadingMore(true);
      setPage(page + 1);
    }
  };

  /*************************************************************/
  /**   This function will handle Normal API call with tags   **/
  /*************************************************************/
  const handleChannelAPI = async () => {
    try {
      const apiURL = envConfig.EPNS_SERVER + envConfig.ENDPOINT_FETCH_CHANNELS;
      let requestURL = `${apiURL}?limit=${GLOBALS.CONSTANTS.FEED_ITEMS_TO_PULL}&page=${page}`;
      if (tag.length > 0 && tag !== Globals.CONSTANTS.ALL_CATEGORIES) {
        requestURL = `${requestURL}&tag=${tag}`;
      }
      const resJson = await fetch(requestURL).then(response => response.json());
      if (page > 1) {
        dispatch(addChannels(resJson.channels));
      } else {
        dispatch(setChannels(resJson.channels));
      }
      if (resJson.channels.length < GLOBALS.CONSTANTS.FEED_ITEMS_TO_PULL) {
        setIsEndReached(true);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  /***************************************************/
  /**   This function will handle search API call   **/
  /***************************************************/
  const handleSearchAPI = async () => {
    try {
      const query = searchQuery.trim();
      if (query.length) {
        const results = await userPushSDKInstance?.channel.search(query, {
          page: page,
          limit: GLOBALS.CONSTANTS.FEED_ITEMS_TO_PULL,
        });
        if (page > 1) {
          dispatch(addChannels(results));
        } else {
          dispatch(setChannels(results));
        }
        if (results.length < GLOBALS.CONSTANTS.FEED_ITEMS_TO_PULL) {
          setIsEndReached(true);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  /***************************************************/
  /**   This function will reset all channel data   **/
  /**     Currently handled for onChangeCategory    **/
  /***************************************************/
  const resetChannelData = () => {
    setIsLoading(true);
    setPage(1);
    dispatch(resetChannels());
    setIsLoadingMore(false);
    setIsEndReached(false);
  };

  return {
    isLoading,
    isLoadingMore,
    loadMore,
    resetChannelData,
  };
};

export default useChannels;
