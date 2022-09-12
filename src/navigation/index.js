import {NavigationContainer} from '@react-navigation/native';
import React, {useEffect, useRef} from 'react';
import {useSelector} from 'react-redux';
import {useDispatch} from 'react-redux';
import GLOBALS from 'src/Globals';
import {selectAuthState} from 'src/redux/authSlice';
import {setLogout} from 'src/redux/authSlice';

import AuthenticatedNavigator from './AuthenticatedNavigator';
import InitializingNavigator from './InitializingNavigator';
import OnboardedNavigator from './OnboardedNavigator';
import OnboardingNavigator from './OnboardingNavigator';

const Screens = () => {
  const authState = useSelector(selectAuthState);
  const dispatch = useDispatch();

  // reset user login
  useEffect(() => {
    dispatch(setLogout(null));
  }, []);

  return (
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
  );
};

export default Screens;
