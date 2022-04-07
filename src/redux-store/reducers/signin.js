import { SIGNIN_USER, SIGNOUT_USER } from 'redux-store/constants'

const initialState = {
  currentUser: '',
  users: [],
}

const authReducer = (state = initialState, action) => {
  switch (action.type) {
    case SIGNIN_USER:
      return {
        ...state,
        currentUser: action.payload.wallet,
        users: [...state.users, action.payload.data],
      }

    case SIGNOUT_USER:
      let allUsers = [...state.users]
      let index = allUsers.findIndex(
        (user) => user.wallet === action.payload.wallet,
      )
      allUsers.splice(index, 1)

      return {
        ...state,
        currentUser:
          state.users.length === 1
            ? ''
            : state.users[state.users.length - 1].wallet,
        users: allUsers,
      }

    default:
      return state
  }
}

export default authReducer
