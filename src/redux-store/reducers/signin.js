import { SIGNIN_USER, SIGNOUT_USER } from '../constants'

const initialCurrentUserState = {
  wallet: '',
  userPKey: '',
  index: 0,
}

const initialState = {
  currentUser: initialCurrentUserState,
  users: [],
}

const authReducer = (state = initialState, action) => {
  switch (action.type) {
    case SIGNIN_USER:
      return {
        ...state,
        currentUser: action.payload.user,
        users: [...state.users, action.payload.data],
      }

    case SIGNOUT_USER:
      let allUsers = [...state.users]
      let index = allUsers.findIndex(
        (user) => user.wallet === action.payload.wallet,
      )

      allUsers.splice(index, 1)

      let previousUser = initialCurrentUserState

      if (state.users.length > 1) {
        const user = state.users[state.users.length - 1]

        const index = state.users.findIndex((object) => {
          return object.id === 'b'
        })

        previousUser.wallet = user.wallet
        previousUser.userPKey = user.userPKey
      }

      return {
        ...state,
        currentUser:
          state.users.length === 1
            ? initialCurrentUserState
            : state.users[state.users.length - 1].wallet,
        users: allUsers,
      }

    default:
      return state
  }
}

export default authReducer
