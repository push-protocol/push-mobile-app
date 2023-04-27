import {NavigationContainer} from '@react-navigation/native';
import React, {useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import GLOBALS from 'src/Globals';
import IncomingCall from 'src/components/modals/IncomingCall';
import {selectAuthState, setLogout} from 'src/redux/authSlice';
import {selectUsers} from 'src/redux/authSlice';
import {selectVideoCall} from 'src/redux/videoSlice';

import AuthenticatedNavigator from './AuthenticatedNavigator';
import InitializingNavigator from './InitializingNavigator';
import OnboardedNavigator from './OnboardedNavigator';
import OnboardingNavigator from './OnboardingNavigator';
import useVideoSocket from './screens/video/helpers/useVideoSocket';

const Screens = () => {
  const authState = useSelector(selectAuthState);
  const [connectedUser] = useSelector(selectUsers);
  console.log('its-----$$$$$$', connectedUser);

  console.log('auth state was', authState);

  const dispatch = useDispatch();
  const {call} = useSelector(selectVideoCall);
  useVideoSocket('0xD26A7BF7fa0f8F1f3f73B056c9A67565A6aFE63c');

  // reset user login
  useEffect(() => {
    dispatch(setLogout(null));
  }, []);

  return (
    <>
      <NavigationContainer>
        {call.isReceivingCall && <IncomingCall />}
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
