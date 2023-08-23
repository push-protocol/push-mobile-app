import {Platform} from 'react-native';
import RNCallKeep, {EventHandlers} from 'react-native-callkeep';
import {getUUID} from 'src/push_video/payloads/helpers';

class CallKeepHelper {
  currentCallId: string | null;

  constructor() {
    this.currentCallId = null;
  }

  configure = async (
    answerCall: EventHandlers['answerCall'],
    endCall: EventHandlers['endCall'],
  ) => {
    try {
      if (Platform.OS === 'android') {
        await this.setupCallKeep();
        RNCallKeep.setAvailable(true);
      }
      RNCallKeep.addEventListener('answerCall', answerCall);
      RNCallKeep.addEventListener('endCall', endCall);
    } catch (error: any) {
      console.error('Error initializing callkeep:', error?.message);
    }
  };

  setupCallKeep = async () => {
    try {
      return await RNCallKeep.setup({
        ios: {
          appName: 'Push (EPNS)',
          supportsVideo: true,
          maximumCallGroups: '1',
          maximumCallsPerCallGroup: '1',
        },
        android: {
          alertTitle: 'Permissions required',
          alertDescription: 'Push (EPNS) needs to access your phone accounts',
          cancelButton: 'Cancel',
          okButton: 'Ok',
          imageName: 'phone_account_icon',
          additionalPermissions: [],
          // Required to get audio in background when using Android 11
          foregroundService: {
            channelId: 'com.company.my',
            channelName: 'Foreground service for my app',
            notificationTitle: 'My app is running on background',
            notificationIcon: 'Path to the resource icon of the notification',
          },
        },
      });
    } catch (error: any) {
      console.error('Error initializing callkeep:', error?.message);
    }
  };

  // Use startCall to ask the system to start a call - Initiate an outgoing call from this point
  startCall = (addressTrimmed: string) => {
    RNCallKeep.startCall(
      this.getCurrentCallId(),
      addressTrimmed,
      addressTrimmed,
      'generic',
      true,
    );
  };

  reportEndCallWithUUID = (callUUID: string, reason: number) => {
    RNCallKeep.reportEndCallWithUUID(callUUID, reason);
  };

  endIncomingcallAnswer = () => {
    if (this.currentCallId) {
      RNCallKeep.endCall(this.currentCallId);
      this.currentCallId = null;
    }
    this.removeEvents();
  };

  removeEvents = () => {
    RNCallKeep.removeEventListener('answerCall');
    RNCallKeep.removeEventListener('endCall');
  };

  displayIncomingCall = (addressTrimmed: string) => {
    Platform.OS === 'android' && RNCallKeep.setAvailable(false);
    RNCallKeep.displayIncomingCall(
      this.getCurrentCallId(),
      addressTrimmed,
      addressTrimmed,
      'generic',
      true,
    );
  };

  backToForeground = () => {
    RNCallKeep.backToForeground();
  };

  getCurrentCallId = () => {
    if (!this.currentCallId) {
      this.currentCallId = getUUID();
    }
    return this.currentCallId;
  };

  endAllCall = () => {
    RNCallKeep.endAllCalls();
    this.currentCallId = null;
    this.removeEvents();
  };

  setupEventListeners() {
    if (Platform.OS === 'ios') {
      // --- NOTE: You still need to subscribe / handle the rest events as usuall.
      // --- This is just a helper whcih cache and propagate early fired events if and only if for
      // --- "the native events which DID fire BEFORE js bridge is initialed",
      // --- it does NOT mean this will have events each time when the app reopened.
      // ===== Step 1: subscribe `register` event =====
      // --- this.onVoipPushNotificationRegistered
      // ===== Step 4: register =====
      // --- it will be no-op if you have subscribed before (like in native side)
      // --- but will fire `register` event if we have latest cahced voip token ( it may be empty if no token at all )
    }
  }

  getCaller(jsonObj: any) {
    try {
      const bodyStr = jsonObj.notification.body;
      const regex = /0x[\w]+/;
      const match = bodyStr.match(regex);
      return match[0];
    } catch (error) {
      console.log('got err', error);
    }
    return 'abishek';
  }

  formatEthAddress(address: string) {
    const prefix = address.slice(0, 6);
    const suffix = address.slice(38);
    return `${prefix}...${suffix}`;
  }

  isVideoCall(jsonObj: any) {
    try {
      const bodyStr = jsonObj.notification.title;
      const regex = /Push Video - Video Call from/;
      const match = bodyStr.match(regex);
      console.log('is a video call', match !== null);
      return match !== null;
    } catch (error) {
      console.log('got err', error);
    }
    return false;
  }
}

export default new CallKeepHelper();
