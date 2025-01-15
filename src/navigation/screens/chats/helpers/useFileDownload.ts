import {useState} from 'react';
import {PermissionsAndroid, Platform, Share} from 'react-native';
import RNBlobUtil from 'react-native-blob-util';
import {Toaster, ToasterOptions} from 'src/components/indicators/Toaster';

const androidDownloadDir = '/storage/emulated/0/Download';

const useFileDownload = (
  base64DataWithPrefix: string,
  fileName: string,
  toastRef?: React.RefObject<Toaster>,
): [boolean, Function] => {
  const [isDownloading, setIsDownloading] = useState(false);

  // Request Storage Permissions (Android)
  const requestStoragePermission = async () => {
    if (Platform.OS === 'android' && Platform.Version <= 28) {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        {
          title: 'Storage Permission Required',
          message:
            "The PUSH app requires access to your device's storage to download files.",
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );

      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true; // Permissions are automatically granted for iOS and Android 10+
  };

  const handleIOSDownload = (filePath: string) => {
    // Share will give option to download the file on iOS Public directory
    Share.share({
      url: `file://${filePath}`,
    })
      .then(res => {
        if (
          res.action === 'sharedAction' &&
          res.activityType === 'com.apple.DocumentManagerUICore.SaveToFiles'
        ) {
          if (toastRef) {
            toastRef.current?.showToast(
              'File Saved successfully!',
              '',
              ToasterOptions.TYPE.GRADIENT_PRIMARY,
            );
          }
        }
      })
      .catch(err => console.log('iOS share error', err))
      .finally(() => setIsDownloading(false));
  };

  const handleAndroidDownload = () => {
    // file is already saved in android public directory
    setIsDownloading(false);
    if (toastRef) {
      toastRef.current?.showToast(
        'File downloaded successfully!',
        '',
        ToasterOptions.TYPE.GRADIENT_PRIMARY,
      );
    }
  };

  // Save Base64 File
  const saveBase64File = async () => {
    setIsDownloading(true);
    try {
      // Request permission for Android
      const hasPermission = await requestStoragePermission();
      if (!hasPermission) {
        console.log('Storage permission denied');
        setIsDownloading(false);
        return;
      }

      // Remove MIME type prefix from Base64 string
      const base64Data = base64DataWithPrefix.split(',')[1];

      // Define the file path
      const filePath =
        Platform.OS === 'android'
          ? `${androidDownloadDir}/${fileName}` // Public Downloads on Android
          : `${RNBlobUtil.fs.dirs.CacheDir}/${fileName}`; // Documents directory on iOS

      // Check if the file exists
      const fileExists = await RNBlobUtil.fs.exists(filePath);

      if (fileExists) {
        // Delete the file if it exists
        await RNBlobUtil.fs.unlink(filePath);
      }

      // Write the file
      await RNBlobUtil.fs.writeFile(filePath, base64Data, 'base64');
      if (Platform.OS === 'ios') {
        handleIOSDownload(filePath);
      } else {
        handleAndroidDownload();
      }
    } catch (error) {
      console.error('Error saving file:', error);
      setIsDownloading(false);
    }
  };

  return [isDownloading, saveBase64File];
};

export {useFileDownload};
