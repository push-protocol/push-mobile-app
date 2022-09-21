import { createSlice } from '@reduxjs/toolkit';
import { ToasterOptions } from 'src/components/indicators/Toaster';
import ENV_CONFIG from 'src/env.config';
import AppBadgeHelper from 'src/helpers/AppBadgeHelper';

const initialState = {
  feed: [],
  page: 1,
  refreshing: false,
  loading: false,
  endReached: false,
};

const feedSlice = createSlice({
  name: 'feed',
  initialState,
  reducers: {
    setFeed: (state, action) => {
      state.feed = [...action.payload];
    },
    clearFeed: (state, action) => {
      state.feed = [];
    },
    addMoreFeed: (state, action) => {
      state.feed = [...state.feed, ...action.payload];
    },
    setPage: (state, action) => {
      state.page = action.payload;
    },
    setRefreshing: (state, action) => {
      state.refreshing = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setEndReached: (state, action) => {
      state.endReached = action.payload;
    },
  },
});

export const selectFeedState = state => state.feed;

export const {
  setFeed,
  addMoreFeed,
  setPage,
  setRefreshing,
  setLoading,
  setEndReached,
  clearFeed,
} = feedSlice.actions;

export default feedSlice.reducer;

export const fetchFeedData = ({
  wallet,
  rewrite = true,
  ToasterFunc,
  page = 1,
  loading = false,
  endReached = false,
}) => {
  return async dispatch => {
    if (!endReached || rewrite === true) {
      if (!loading) {
        // Check if this is a rewrite
        let paging = page;
        if (rewrite) {
          paging = 1;
        }

        dispatch(setLoading(true));
        const apiURL = ENV_CONFIG.EPNS_SERVER + ENV_CONFIG.ENDPOINT_GET_FEEDS;

        await fetch(apiURL, {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user: wallet,
            page: paging,
            pageSize: 20,
            op: 'read',
          }),
        })
          .then(response => response.json())
          .then(resJson => {
            if (resJson.count !== 0 && resJson.results !== []) {
              // clear the notifs if present
              AppBadgeHelper.setAppBadgeCount(0);

              // toast.current.show('New Notifications fetched')
              if (rewrite) {
                dispatch(setFeed([...resJson.results]));
                dispatch(setEndReached(false));
              } else {
                dispatch(addMoreFeed([...resJson.results]));
              }

              dispatch(setPage(paging + 1));

              ToasterFunc &&
                ToasterFunc(
                  'New Notifications Loaded!',
                  '',
                  ToasterOptions.TYPE.GRADIENT_PRIMARY,
                );
            } else {
              dispatch(setEndReached(true));
              ToasterFunc &&
                ToasterFunc(
                  'No More Notifications',
                  '',
                  ToasterOptions.TYPE.ERROR,
                );
            }
          })
          .catch(error => {
            console.warn(error);
          });

        dispatch(setLoading(false));
        dispatch(setRefreshing(false));
      }
    }
  };
};
