import {
  SIGNIN_USER,
  SIGNOUT,
  SET_AUTH_STATE,
  SET_INITIAL_USER,
} from '../constants'
import Globals from 'src/Globals'

const initialCurrentUserState = {
  wallet: '',
  userPKey: '',
  index: 0,
}

const initialState = {
  currentUser: initialCurrentUserState,
  users: [],
  authState: Globals.APP_AUTH_STATES.INITIALIZING,
}

const authReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_INITIAL_USER:
      return {
        ...state,
        currentUser: action.payload,
      }

    case SET_AUTH_STATE:
      return {
        ...state,
        authState: action.payload,
      }

    case SIGNIN_USER:
      return {
        ...state,
        currentUser: action.payload.user,
        users: [...state.users, action.payload.data],
      }

    case SIGNOUT:
      return initialState

    default:
      return state
  }
}

export default authReducer
