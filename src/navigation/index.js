import {NavigationContainer} from '@react-navigation/native';
import React, {useEffect} from 'react';
import {Platform} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import GLOBALS from 'src/Globals';
import IncomingCall from 'src/components/modals/IncomingCall';
import {ModalsWrapper} from 'src/components/modals/ModalsWrapper';
import DeeplinkContextProvider from 'src/contexts/DeeplinkContext';
import PushApiContextProvider from 'src/contexts/PushApiContext';
import SheetContextProvider from 'src/contexts/SheetContext';
import ToasterContextProvider from 'src/contexts/ToasterContext';
import CallkeepHelper from 'src/helpers/CallkeepHelper';
import {selectAuthState, setLogout} from 'src/redux/authSlice';
import {selectUsers} from 'src/redux/authSlice';
import {selectVideoCall} from 'src/redux/videoSlice';
import {useGlobalSocket} from 'src/socket';

import AuthenticatedNavigator from './AuthenticatedNavigator';
import InitializingNavigator from './InitializingNavigator';
import OnboardedNavigator from './OnboardedNavigator';
import OnboardingNavigator from './OnboardingNavigator';
import {navigationRef} from './RootNavigation';
import {linkingConfig} from './config/navigation-linking';
import useVideoSocket from './screens/video/helpers/useVideoSocket';

const NavGlobalSocket = ({callAccepted, connectedUser}) => {
  useVideoSocket(connectedUser.wallet, callAccepted);
  useGlobalSocket(connectedUser.wallet);
};

const Screens = ({callAccepted}) => {
  const authState = useSelector(selectAuthState);
  const [connectedUser] = useSelector(selectUsers);

  const dispatch = useDispatch();
  const {isReceivingCall} = useSelector(selectVideoCall);

  // reset user login
  useEffect(() => {
    dispatch(setLogout(null));
  }, []);

  return (
    <>
      <ToasterContextProvider>
        <PushApiContextProvider>
          <NavigationContainer ref={navigationRef} linking={linkingConfig}>
            <DeeplinkContextProvider>
              {/* Show Modal on Android devices and iOS devices in China */}
              {isReceivingCall &&
                (Platform.OS === 'android' ||
                  (Platform.OS === 'ios' && CallkeepHelper.isChina())) && (
                  <IncomingCall />
                )}

              {authState === GLOBALS.AUTH_STATE.INITIALIZING && (
                <InitializingNavigator />
              )}
              {authState === GLOBALS.AUTH_STATE.ONBOARDING && (
                <OnboardingNavigator />
              )}

              {authState === GLOBALS.AUTH_STATE.ONBOARDED && (
                <OnboardedNavigator />
              )}

              {authState === GLOBALS.AUTH_STATE.AUTHENTICATED && (
                <>
                  {connectedUser && (
                    <NavGlobalSocket
                      callAccepted={callAccepted}
                      connectedUser={connectedUser}
                    />
                  )}
                  <SheetContextProvider>
                    <AuthenticatedNavigator />
                  </SheetContextProvider>
                </>
              )}
            </DeeplinkContextProvider>
          </NavigationContainer>
          <ModalsWrapper />
        </PushApiContextProvider>
      </ToasterContextProvider>
    </>
  );
};

export default Screens;
