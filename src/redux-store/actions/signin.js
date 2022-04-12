import {
  SIGNOUT,
  SIGNOUT_USER,
  SET_AUTH_STATE,
  SET_INITIAL_USER,
  SWITCH_USER,
} from '../constants'

export const signIn = (payload) => {
  return {
    type: SIGNOUT,
    payload,
  }
}

export const signOut = () => {
  return {
    type: SIGNOUT_USER,
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
