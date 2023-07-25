import { NavigationContainer } from '@react-navigation/native';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import GLOBALS from 'src/Globals';
import IncomingCall from 'src/components/modals/IncomingCall';
import { selectAuthState, setLogout } from 'src/redux/authSlice';
import { selectUsers } from 'src/redux/authSlice';
import { selectVideoCall } from 'src/redux/videoSlice';
import { useGlobalSocket } from 'src/socket';

import AuthenticatedNavigator from './AuthenticatedNavigator';
import InitializingNavigator from './InitializingNavigator';
import OnboardedNavigator from './OnboardedNavigator';
import OnboardingNavigator from './OnboardingNavigator';
import useVideoSocket from './screens/video/helpers/useVideoSocket';

const NavGlobalSocket = ({ callAccepted, connectedUser }) => {
  const authState = useSelector(selectAuthState);
  // useVideoSocket(connectedUser.wallet, callAccepted);
  console.log("I was called with ", authState);
  useGlobalSocket(connectedUser.wallet);
  useEffect(() => { }, []);
};

const Screens = ({ callAccepted }) => {
  const authState = useSelector(selectAuthState);
  const [connectedUser] = useSelector(selectUsers);
  console.log('auth state was', authState);

  const dispatch = useDispatch();
  const { isReceivingCall } = useSelector(selectVideoCall);

  // reset user login
  useEffect(() => {
    dispatch(setLogout(null));
  }, []);

  return (
    <>
      <NavigationContainer>
        {isReceivingCall && <IncomingCall />}

        {authState === GLOBALS.AUTH_STATE.INITIALIZING && (
          <InitializingNavigator />
        )}
        {authState === GLOBALS.AUTH_STATE.ONBOARDING && <OnboardingNavigator />}

        {authState === GLOBALS.AUTH_STATE.ONBOARDED && <OnboardedNavigator />}

        {authState === GLOBALS.AUTH_STATE.AUTHENTICATED && (
          <>
            {connectedUser && (
              <NavGlobalSocket
                callAccepted={callAccepted}
                connectedUser={connectedUser}
              />
            )}
            <AuthenticatedNavigator />
          </>
        )}
      </NavigationContainer>
    </>
  );
};

export default Screens;
