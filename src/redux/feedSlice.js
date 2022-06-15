import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  feed: [],
  page: 1,
  refreshing: false,
  loading: false,
  endReached: false,
}

const feedSlice = createSlice({
  name: 'feed',
  initialState,
  reducers: {
    setFeed: (state, action) => {
      state.feed = [...action.payload]
    },
    addMoreFeed: (state, action) => {
      state.feed = [...state.feed, ...action.payload]
    },
    setPage: (state, action) => {
      state.page = action.payload
    },
    setRefreshing: (state, action) => {
      state.refreshing = action.payload
    },
    setLoading: (state, action) => {
      state.loading = action.payload
    },
    setEndReached: (state, action) => {
      state.endReached = action.payload
    },
  },
})

export const selectFeedState = (state) => state.feed

export const {
  setFeed,
  addMoreFeed,
  setPage,
  setRefreshing,
  setLoading,
  setEndReached,
} = feedSlice.actions

export default feedSlice.reducer
