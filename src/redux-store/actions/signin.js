import {
  SIGNOUT_USER,
  SET_AUTH_STATE,
  SET_INITIAL_USER,
  SWITCH_USER,
  SIGNIN_USER,
  SET_USER,
  SET_NEW_SIGNIN_STATUS,
} from '../constants'

export const signOut = (payload) => {
  return {
    type: SIGNOUT_USER,
    payload,
  }
}

export const setAuthState = (payload) => {
  return {
    type: SET_AUTH_STATE,
    payload,
  }
}

export const setInitialUser = (payload) => {
  return {
    type: SET_INITIAL_USER,
    payload,
  }
}

export const switchUser = (payload) => {
  return {
    type: SWITCH_USER,
    payload,
  }
}

export const createNewWallet = (payload) => {
  return {
    type: SIGNIN_USER,
    payload,
  }
}

export const setWallet = (payload) => {
  return {
    type: SET_USER,
    payload,
  }
}

export const setNewSignInStatus = (payload) => {
  return {
    type: SET_NEW_SIGNIN_STATUS,
    payload,
  }
}
