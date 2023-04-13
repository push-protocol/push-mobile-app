import {NavigationContainer} from '@react-navigation/native';
import React, {useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import GLOBALS from 'src/Globals';
import IncomingCall from 'src/components/modals/IncomingCall';
import {selectAuthState, setLogout} from 'src/redux/authSlice';
import {selectVideoCall, setupGlobalSocket} from 'src/redux/videoSlice';

import AuthenticatedNavigator from './AuthenticatedNavigator';
import InitializingNavigator from './InitializingNavigator';
import OnboardedNavigator from './OnboardedNavigator';
import OnboardingNavigator from './OnboardingNavigator';

const Screens = () => {
  const authState = useSelector(selectAuthState);
  console.log('auth state was', authState);
  const dispatch = useDispatch();
  const {call} = useSelector(selectVideoCall);

  // reset user login
  useEffect(() => {
    dispatch(setLogout(null));
    console.log('calling setup global socket');
    setupGlobalSocket('0x3aae65DF8424b0Bb80C1f74dD480b04dbEA54213');
  }, []);

  return (
    <>
      {call.isReceivingCall && <IncomingCall />}
      <NavigationContainer>
        {authState === GLOBALS.AUTH_STATE.INITIALIZING && (
          <InitializingNavigator />
        )}
        {authState === GLOBALS.AUTH_STATE.ONBOARDING && <OnboardingNavigator />}

        {authState === GLOBALS.AUTH_STATE.ONBOARDED && <OnboardedNavigator />}

        {authState === GLOBALS.AUTH_STATE.AUTHENTICATED && (
          <AuthenticatedNavigator />
        )}
      </NavigationContainer>
    </>
  );
};

export default Screens;
