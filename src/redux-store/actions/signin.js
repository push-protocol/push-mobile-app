import { SIGNIN_USER, SIGNOUT_USER } from '../constants'

export const signIn = (data) => {
  return {
    type: SIGNIN_USER,
    payload: data,
  }
}

export const signOut = (data) => {
  return {
    type: SIGNOUT_USER,
    payload: data,
  }
}
