import {useDispatch, useSelector} from 'react-redux';
import GLOBALS from 'src/Globals';
import {selectUsers, setAuthState} from 'src/redux/authSlice';
import MetaStorage from 'src/singletons/MetaStorage';

const useAuth = () => {
  const dispatch = useDispatch();
  const users = useSelector(selectUsers);

  const login = async (overrideUsers?: Array<Object>) => {
    // Set SignedIn to true
    await MetaStorage.instance.setIsSignedIn(true);

    // Set First Sign in to true
    await MetaStorage.instance.setFirstSignInByUser(true);

    // Reset number of passcode attempts since it's a valid login
    await MetaStorage.instance.setRemainingPasscodeAttempts(
      GLOBALS.CONSTANTS.MAX_PASSCODE_ATTEMPTS,
    );

    // Set Push Notification Badge
    await MetaStorage.instance.setCurrentAndPreviousBadgeCount(0, 0);

    // Set Stored Wallets
    await MetaStorage.instance.setStoredWallets(
      overrideUsers ? overrideUsers : users,
    );

    dispatch(setAuthState(GLOBALS.AUTH_STATE.AUTHENTICATED));
  };

  return {login};
};

export default useAuth;

export const withUseAuth = (Component: any) => {
  return function WrappedComponent(props: any) {
    const {login} = useAuth();
    return <Component {...props} login={login} />;
  };
};
