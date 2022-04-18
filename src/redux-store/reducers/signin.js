import {
  SIGNIN_USER,
  SIGNOUT_USER,
  SET_AUTH_STATE,
  SET_INITIAL_USER,
  SWITCH_USER,
  SET_USER,
  SET_NEW_SIGNIN_STATUS,
} from '../constants'
import Globals from 'src/Globals'

const initialCurrentUserState = {
  wallet: '',
  userPKey: '',
  index: 0,
}

const initialState = {
  users: [initialCurrentUserState],
  activeUser: 0,
  authState: Globals.APP_AUTH_STATES.INITIALIZING,
  isNew: 0,
}

const authReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_NEW_SIGNIN_STATUS:
      return {
        ...state,
        isNew: action.payload,
      }

    case SET_USER:
      let users = [...state.users]
      users[action.payload.index] = {
        wallet: action.payload.wallet,
        userPKey: action.payload.userPKey,
        index: action.payload.index,
      }

      return {
        ...state,
        users,
      }

    case SWITCH_USER:
      return {
        ...state,
        activeUser: action.payload,
      }

    case SET_INITIAL_USER:
      return {
        ...state,
        users: [
          {
            ...state.users[0],
            ...action.payload,
          },
        ],
        activeUser: 0,
      }

    case SET_AUTH_STATE:
      return {
        ...state,
        authState: action.payload,
      }

    case SIGNIN_USER:
      const { wallet, userPKey } = action.payload
      const newIndex = state.users.length
      const newUser = {
        index: newIndex,
        wallet,
        userPKey,
      }

      const modifiedUsers = [...state.users]
      modifiedUsers.push(newUser)

      return {
        ...state,
        users: modifiedUsers,
        activeUser: newIndex,
        authState: Globals.APP_AUTH_STATES.ONBOARDING,
        isNew: 1,
      }

    case SIGNOUT_USER:
      return {
        activeUser: 0,
        users: [
          {
            wallet: '',
            userPKey: '',
            index: 0,
          },
        ],
        authState: Globals.APP_AUTH_STATES.ONBOARDING,
      }

    default:
      return state
  }
}

export default authReducer
