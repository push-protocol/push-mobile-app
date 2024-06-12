import * as LocalAuthentication from 'expo-local-authentication';

// Biometric Helper Function
const BiometricHelper = {
  // To Return Supported Biometric Type or False
  getSupportedBiometric: async function () {
    let biometric:
      | false
      | LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION
      | LocalAuthentication.AuthenticationType.FINGERPRINT = false;
    const hasHardwareSupport =
      (await LocalAuthentication.hasHardwareAsync()) &&
      (await LocalAuthentication.isEnrolledAsync());

    if (hasHardwareSupport) {
      // Great, Check if it's touchID or faceID
      const supportedTech =
        await LocalAuthentication.supportedAuthenticationTypesAsync();
      if (supportedTech.length !== 0) {
        for (var i = 0; i < supportedTech.length; i++) {
          const type = supportedTech[i];

          if (
            type === LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION
          ) {
            // Set this up and exit as this is default
            biometric = type;
            break;
          } else if (
            type === LocalAuthentication.AuthenticationType.FINGERPRINT
          ) {
            // Keep on going as FaceID is preferred
            biometric = type;
          }
        }
      }
    }

    return biometric;
  },
};

export default BiometricHelper;
