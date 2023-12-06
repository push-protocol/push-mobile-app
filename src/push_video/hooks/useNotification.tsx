import {VideoCallStatus} from '@pushprotocol/restapi';
import messaging from '@react-native-firebase/messaging';
import {useCallback, useEffect, useState} from 'react';
import {Platform} from 'react-native';
import RNCallKeep, {InitialEvents} from 'react-native-callkeep';
import VoipPushNotification from 'react-native-voip-push-notification';
import AppBadgeHelper from 'src/helpers/AppBadgeHelper';
import CallkeepHelper from 'src/helpers/CallkeepHelper';
import MetaStorage from 'src/singletons/MetaStorage';
import Notify from 'src/singletons/Notify';

const handleAppNotificationBadge = async () => {
  await AppBadgeHelper.setAppBadgeCount(0);
};

export const useNotification = () => {
  const [numBgCallAccepted, setNumBgCallAccepted] = useState(0);

  const answerIncomingCall = useCallback(() => {
    MetaStorage.instance.setBackgroundCallAccepted(false);
    setNumBgCallAccepted(prev => prev + 1);
  }, []);

  const endIncomingCall = useCallback(() => {
    CallkeepHelper.endAllCall();
  }, []);

  // Background call handling for android
  useEffect(() => {
    if (Platform.OS === 'android') {
      RNCallKeep.addEventListener('answerCall', async () => {
        if (Platform.OS === 'android') {
          CallkeepHelper.backToForeground();
          CallkeepHelper.endAllCall();
        }
        answerIncomingCall();
      });

      RNCallKeep.addEventListener('endCall', async () => {
        endIncomingCall();
      });
    }
  }, []);

  // Background call handling for ios
  useEffect(() => {
    RNCallKeep.addEventListener(
      'didLoadWithEvents',
      // @ts-ignore Incorrect type definition
      (events: InitialEvents) => {
        const answerCallEvent = events.find(
          event => event.name === 'RNCallKeepPerformAnswerCallAction',
        );
        if (answerCallEvent) {
          answerIncomingCall();
        }
      },
    );

    VoipPushNotification.addEventListener('register', token => {
      MetaStorage.instance.setApnsVoipToken(token);
    });

    VoipPushNotification.addEventListener('notification', notification => {
      const {status, uuid} = notification as {
        status: VideoCallStatus;
        uuid: string;
      };
      if (status === VideoCallStatus.INITIALIZED) {
        CallkeepHelper.configure(answerIncomingCall, endIncomingCall);
      } else if (status === VideoCallStatus.DISCONNECTED) {
        endIncomingCall();
      }
      VoipPushNotification.onVoipNotificationCompleted(uuid);
    });

    VoipPushNotification.addEventListener(
      'didLoadWithEvents',
      (events: any) => {
        // If loaded with notification received events
        if (events.length >= 2) {
          const status = events[0].data?.status || events[1].data?.status;
          const uuid = events[0].data?.uuid || events[1].data?.uuid;
          if (status === VideoCallStatus.INITIALIZED) {
            CallkeepHelper.configure(answerIncomingCall, endIncomingCall);
          } else if (status === VideoCallStatus.DISCONNECTED) {
            endIncomingCall();
          }
          VoipPushNotification.onVoipNotificationCompleted(uuid);
        }
      },
    );

    Platform.OS === 'ios' && VoipPushNotification.registerVoipToken();

    return () => {
      VoipPushNotification.removeEventListener('didLoadWithEvents');
      VoipPushNotification.removeEventListener('register');
      VoipPushNotification.removeEventListener('notification');
    };
  }, []);

  useEffect(() => {
    // PUSH NOTIFICATIONS HANDLING
    Notify.instance.requestDeviceToken(true);

    // Listen to whether the token changes
    const onTokenRefresh = messaging().onTokenRefresh(token => {
      Notify.instance.saveDeviceToken(token, true); // true means it's a refresh
    });

    return () => {
      onTokenRefresh;
      handleAppNotificationBadge();
    };
  }, []);

  return {
    numBgCallAccepted,
  };
};
