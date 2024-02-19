import {Camera} from 'expo-camera';

const usePermissions = () => {
  const getCameraPermissionAsync = async ({
    onPermissionGranted,
    onPermissionDenied,
  }: {
    onPermissionGranted: () => void;
    onPermissionDenied: () => void;
  }) => {
    const permission = await Camera.getCameraPermissionsAsync();
    if (permission.granted || (await Camera.requestCameraPermissionsAsync())) {
      onPermissionGranted();
      return;
    }
    onPermissionDenied();
  };

  return {getCameraPermissionAsync};
};

export default usePermissions;
