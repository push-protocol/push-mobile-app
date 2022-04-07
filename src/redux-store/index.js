import { createStore, combineReducers } from 'redux'
import SignInReducer from './reducers/signin'

const rootReducer = combineReducers({ auth: SignInReducer })

const configureStore = () => {
  return createStore(rootReducer)
}

const store = configureStore()

export default store
