const callKeepHelper = {
  options: {
    ios: {
      appName: 'Push (EPNS)',
    },
    android: {
      alertTitle: 'Permissions required',
      alertDescription: 'This application needs to access your phone accounts',
      cancelButton: 'Cancel',
      okButton: 'ok',
      imageName: 'phone_account_icon',
      // additionalPermissions: [PermissionsAndroid.PERMISSIONS.example],
      // Required to get audio in background when using Android 11
      foregroundService: {
        channelId: 'com.company.my',
        channelName: 'Foreground service for my app',
        notificationTitle: 'My app is running on background',
        notificationIcon: 'Path to the resource icon of the notification',
      },
      additionalPermissions: [],
    },
  },
  getCaller: (jsonObj: any) => {
    try {
      const bodyStr = jsonObj.notification.body;
      const regex = /0x[\w]+/;
      const match = bodyStr.match(regex);
      return match[0];
    } catch (error) {
      console.log('got err', error);
    }
    return 'abishek';
  },

  formatEthAddress: (address: string) => {
    const prefix = address.slice(0, 6);
    const suffix = address.slice(38);
    return `${prefix}...${suffix}`;
  },

  isVideoCall: (jsonObj: any) => {
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
  },
};

export {callKeepHelper};
