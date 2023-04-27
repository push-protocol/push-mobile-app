const callKeepHelper = {
  options: {
    ios: {
      appName: 'My app name',
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
};

export {callKeepHelper};
