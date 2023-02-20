import {Platform, ToastAndroid} from 'react-native';

export const showSimpleToast = (msg: string) => {
  ToastAndroid.show(msg, ToastAndroid.SHORT);
  if (Platform.OS === 'android') {
    ToastAndroid.show(msg, ToastAndroid.SHORT);
  } else {
    // TODO fix
  }
};
