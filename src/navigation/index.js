import {VideoCallStatus} from '@pushprotocol/restapi';
import {NavigationContainer} from '@react-navigation/native';
import React, {useContext, useEffect} from 'react';
import VoipPushNotification from 'react-native-voip-push-notification';
import {useDispatch, useSelector} from 'react-redux';
import GLOBALS from 'src/Globals';
import IncomingCall from 'src/components/modals/IncomingCall';
import {VideoCallContext} from 'src/contexts/VideoContext';
import {getCallInfoFromServer} from 'src/navigation/screens/video/helpers/useVideoSocket';
import {selectAuthState, setLogout} from 'src/redux/authSlice';
import {selectUsers} from 'src/redux/authSlice';
import {selectVideoCall} from 'src/redux/videoSlice';
import {useGlobalSocket} from 'src/socket';

import CallkeepHelper from '../callkeep';
import AuthenticatedNavigator from './AuthenticatedNavigator';
import InitializingNavigator from './InitializingNavigator';
import OnboardedNavigator from './OnboardedNavigator';
import OnboardingNavigator from './OnboardingNavigator';
import useVideoSocket from './screens/video/helpers/useVideoSocket';

const NavGlobalSocket = ({callAccepted, connectedUser}) => {
  useVideoSocket(connectedUser.wallet, callAccepted);
  useGlobalSocket(connectedUser.wallet);
};

const Screens = ({callAccepted}) => {
  const authState = useSelector(selectAuthState);
  const [connectedUser] = useSelector(selectUsers);
  const {acceptRequestWrapper, incomingCall} = useContext(VideoCallContext);

  const dispatch = useDispatch();
  const {isReceivingCall} = useSelector(selectVideoCall);

  // reset user login
  useEffect(() => {
    dispatch(setLogout(null));
  }, []);

  useEffect(() => {
    VoipPushNotification.addEventListener('register', token => {
      console.log('Registering APN token:', token);
      // setAPN(token);
    });

    VoipPushNotification.addEventListener('notification', notification => {
      const {status, uuid} = notification;
      //  as {
      //   callerName: string;
      //   details: {title: string; body: string};
      //   status: number;
      //   uuid: string;
      // };
      if (status === VideoCallStatus.INITIALIZED) {
        const incomingCallAnswer = async ({callUUID}) => {
          // updateCallStatus({
          // callerInfo,
          // type: 'ACCEPTED',
          // });
          // navigation.navigate(SCREEN_NAMES.Meeting, {
          // name: 'Person B',
          // token: videoSDKInfo.token,
          // meetingId: videoSDKInfo.meetingId,
          // });
          const [success, videoMeta] = await getCallInfoFromServer(
            connectedUser.wallet,
          );
          if (success) {
            await incomingCall(videoMeta, false);
            acceptRequestWrapper({
              senderAddress: videoMeta.recipientAddress,
              recipientAddress: videoMeta.senderAddress,
              chatId: videoMeta.chatId,
              signalData: videoMeta.signalData,
            });

            MetaStorage.instance.setBackgroundCallAccepted(true);
            // @ts-ignore
            navigation.navigate(GLOBALS.SCREENS.VIDEOCALL);
          }
        };
        const endIncomingCall = () => {
          CallkeepHelper.endAllCall();
          // updateCallStatus({callerInfo, type: 'REJECTED'});
        };
        CallkeepHelper.configure(incomingCallAnswer, endIncomingCall);
      } else if (status === VideoCallStatus.DISCONNECTED) {
        CallkeepHelper.endAllCall();
      }
      VoipPushNotification.onVoipNotificationCompleted(uuid);
    });

    // VoipPushNotification.addEventListener('didLoadWithEvents', events => {
    //   const {callerInfo, videoSDKInfo, status} =
    //     events.length > 1 && events[1].data;
    //   if (status === VideoCallStatus.INITIALIZED) {
    //     const incomingCallAnswer = ({callUUID}: {callUUID: string}) => {
    //       // updateCallStatus({
    //       //   callerInfo,
    //       //   type: 'ACCEPTED',
    //       // });
    //       // navigation.navigate(SCREEN_NAMES.Meeting, {
    //       //   name: 'Person B',
    //       //   token: videoSDKInfo.token,
    //       //   meetingId: videoSDKInfo.meetingId,
    //       // });
    //     };

    //     const endIncomingCall = () => {
    //       CallkeepHelper.endAllCall();
    //       // updateCallStatus({callerInfo, type: 'REJECTED'});
    //     };

    //     CallkeepHelper.configure(incomingCallAnswer, endIncomingCall);
    //   }
    // });

    // console.log('Registering VoIP token');
    // VoipPushNotification.registerVoipToken();

    return () => {
      VoipPushNotification.removeEventListener('didLoadWithEvents');
      VoipPushNotification.removeEventListener('register');
      VoipPushNotification.removeEventListener('notification');
    };
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
