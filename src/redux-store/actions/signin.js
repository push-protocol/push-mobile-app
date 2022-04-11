import {
  SIGNOUT,
  SIGNOUT_USER,
  SET_AUTH_STATE,
  SET_INITIAL_USER,
} from '../constants'

export const signIn = (data) => {
  return {
    type: SIGNOUT,
    payload: data,
  }
}

export const signOut = () => {
  return {
    type: SIGNOUT_USER,
  }
}

export const setAuthState = (data) => {
  return {
    type: SET_AUTH_STATE,
    payload: data,
  }
}

export const setInitialUser = (data) => {
  return {
    type: SET_INITIAL_USER,
    payload: data,
  }
}
