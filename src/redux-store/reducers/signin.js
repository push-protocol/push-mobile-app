import {
  SIGNIN_USER,
  SIGNOUT,
  SET_AUTH_STATE,
  SET_INITIAL_USER,
  SWITCH_USER,
} from '../constants'
import Globals from 'src/Globals'

const initialCurrentUserState = {
  wallet: '',
  userPKey: '',
  index: 0,
  authState: Globals.APP_AUTH_STATES.INITIALIZING,
}

const initialState = {
  users: [initialCurrentUserState],
  activeUser: 0,
}

const authReducer = (state = initialState, action) => {
  switch (action.type) {
    case SWITCH_USER:
      return {
        ...state,
        activeUser: action.payload,
      }

    case SET_INITIAL_USER:
      return {
        ...state,
        users: [{ ...state.users[0], ...action.payload }],
        activeUser: 0,
      }

    case SET_AUTH_STATE:
      const { index, authState } = action.payload
      let updatedUsers = [...state.users]

      updatedUsers[index].authState = authState

      return {
        ...state,
        users: updatedUsers,
      }

    case SIGNIN_USER:
      const { wallet, userPKey } = action.payload
      const newIndex = state.users.length
      const newUser = {
        authState: Globals.APP_AUTH_STATES.INITIALIZING,
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
      }

    case SIGNOUT:
      return initialState

    default:
      return state
  }
}

export default authReducer
