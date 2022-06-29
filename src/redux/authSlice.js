import { createSlice } from '@reduxjs/toolkit'
import GLOBALS from 'src/Globals'

const initialState = {
  authState: GLOBALS.AUTH_STATE.INITIALIZING,
  users: [],
  currentUser: null,
  isLoggedIn: false,
  newWallet: false,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setInitialSignin: (state, action) => {
      state.users = [action.payload]
      state.currentUser = action.payload.index
      state.isLoggedIn = true
    },

    setAuthState: (state, action) => {
      console.log('Set Auth State', action.payload)
      state.authState = action.payload
    },

    setLogout: (state, action) => {
      state.authState = GLOBALS.AUTH_STATE.INITIALIZING
      state.users = []
      state.currentUser = null
      state.isLoggedIn = false
    },

    setUser: (state, action) => {
      let allUsers = [...state.users]
      allUsers[action.payload.index] = { ...action.payload }
      state.users = allUsers
    },

    switchUser: (state, action) => {
      state.currentUser = action.payload
    },

    createNewWallet: (state, action) => {
      state.currentUser = state.users.length
      state.users = [...state.users, action.payload]
      state.authState = GLOBALS.AUTH_STATE.ONBOARDING
      state.newWallet = true
    },

    deleteUser: (state, action) => {
      state.users.splice(action.payload, 1)
      state.currentUser = state.users.length - 1

      const allUsers = [...state.users]
      const newUsers = []

      for (let i = 0; i < allUsers.length; i++) {
        let newUser = allUsers[i]
        newUser.index = i
        newUsers.push(newUser)
      }

      state.users = newUsers
    },
  },
})

export const selectAuthState = (state) => state.auth.authState
export const selectUsers = (state) => state.auth.users
export const selectCurrentUser = (state) => state.auth.currentUser

export const {
  setInitialSignin,
  setAuthState,
  setLogout,
  setUser,
  switchUser,
  createNewWallet,
  deleteUser,
} = authSlice.actions

export default authSlice.reducer
