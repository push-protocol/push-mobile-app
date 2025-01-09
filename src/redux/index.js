import store from './store';

export const globalDispatch = action => {
  store.dispatch(action);
};

export default store;
