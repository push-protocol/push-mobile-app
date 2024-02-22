import messaging from '@react-native-firebase/messaging';
import {useNavigation, useRoute} from '@react-navigation/native';
import {
  AuthenticationType,
  LocalAuthenticationOptions,
  authenticateAsync,
} from 'expo-local-authentication';
import React, {useEffect, useMemo, useRef, useState} from 'react';
import {Image} from 'react-native';
import {
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  Vibration,
  View,
} from 'react-native';
import * as Keychain from 'react-native-keychain';
import GLOBALS from 'src/Globals';
import PasscodeInput from 'src/components/input/PasscodeInput';
import LoadingSpinner from 'src/components/loaders/LoadingSpinner';
import OnboardingWrapper from 'src/components/misc/OnboardingWrapper';
import BiometricHelper from 'src/helpers/BiometricHelper';
import CryptoHelper from 'src/helpers/CryptoHelper';
import useAuth from 'src/hooks/auth/useAuth';
import MetaStorage from 'src/singletons/MetaStorage';

const STEPS = {
  ENTER_PASSCODE: 'ENTER_PASSCODE',
  VERIFY_PASSCODE: 'VERIFY_PASSCODE',
  PASSCODE_CONFIRMED: 'PASSCODE_CONFIRMED',
};

const ERRORS = {
  PASSCODE_MISMATCH: 'Passcodes do not match',
  INCORRECT_PASSCODE: 'Incorrect Code',
};

const BIOMETRIC_TYPES = {
  TOUCH_ID: 'Touch ID',
  FACE_ID: 'Face ID',
  NULL: 'NULL',
};

const BiometricScreen = () => {
  const [passcode, setPasscode] = useState('');
  const [passcodeMirror, setPasscodeMirror] = useState('');
  const [step, setStep] = useState<string>(STEPS.ENTER_PASSCODE);
  const [biometricSupported, setBiometricSupported] = useState<
    boolean | AuthenticationType
  >();
  const [biometricType, setBiometricType] = useState<string>();
  const [pkeyEncrypted, setPkeyEncrypted] = useState(false);
  const [encryptedPKey, setEncryptedPKey] = useState<string>();
  const [isSetupLoading, setIsSetupLoading] = useState(false);
  const [error, setError] = useState<string>();
  const inputRef = useRef<TextInput>(null);
  const navigation = useNavigation();
  const route = useRoute();
  const {login} = useAuth();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const resetPasscode = (error?: string) => {
    setPasscode('');
    setPasscodeMirror('');
    setStep(STEPS.ENTER_PASSCODE);
    setError(error);
  };

  const validatePasscode = async (value: string) => {
    if (value.length !== GLOBALS.CONSTANTS.PASSCODE_LENGTH) return;
    if (step === STEPS.ENTER_PASSCODE) {
      setPasscodeMirror('');
      setStep(STEPS.VERIFY_PASSCODE);
      inputRef.current?.focus();
    } else {
      console.log('CHECKING', passcode, value, step);
      if (passcode !== value) {
        Vibration.vibrate();
        resetPasscode(ERRORS.PASSCODE_MISMATCH);
      } else {
        Keyboard.dismiss();
        // Encrypt Private Key and Do Hashing
        let encryptedPkey;
        if (!route.params) {
          // encrypted private key is empty to support wallet sign in
          encryptedPkey = '';
        } else {
          // @ts-ignore
          const {privateKey} = route.params;
          encryptedPkey = CryptoHelper.encryptWithAES(privateKey, passcode);
        }
        const hashedCode = await CryptoHelper.hashWithSha256(passcode);
        await MetaStorage.instance.setEncryptedPKeyAndHashedPasscode(
          encryptedPkey,
          hashedCode,
        );

        // Check if biometric is available
        const supported = await BiometricHelper.getSupportedBiometric();

        // If biometrics not supported, go to next screen
        if (supported === false) {
          await loadNextScreen();
        } else {
          let biometricType = BIOMETRIC_TYPES.NULL;

          if (biometricSupported === AuthenticationType.FINGERPRINT) {
            biometricType = BIOMETRIC_TYPES.TOUCH_ID;
          } else if (
            biometricSupported === AuthenticationType.FACIAL_RECOGNITION
          ) {
            biometricType = BIOMETRIC_TYPES.FACE_ID;
          }
          setBiometricType(biometricType);
        }

        setPkeyEncrypted(true);
        setEncryptedPKey(encryptedPkey);
        setBiometricSupported(supported);
        setStep(STEPS.PASSCODE_CONFIRMED);
      }
    }
  };

  const handleEnteredPasscode = (value: string) => {
    // Allow only digits
    if (/^\d+$/.test(value) || value === '') {
      if (error) setError(undefined);
      if (step === STEPS.ENTER_PASSCODE) {
        setPasscode(value);
        validatePasscode(value);
      } else {
        setPasscodeMirror(value);
        validatePasscode(value);
      }
    }
  };

  const loadNextScreenAfterAdditionalSetup = async () => {
    setIsSetupLoading(true);
    // Check if biometric is present, if so present authentication
    // If authenticated, store the passcode on secure chain
    if (biometricSupported) {
      const options: LocalAuthenticationOptions = {
        promptMessage: `Enable ${biometricType} for fast and secure access.`,
        cancelLabel: 'Skip for Now',
        fallbackLabel: '',
        disableDeviceFallback: true,
      };

      const response = await authenticateAsync(options);
      const biometricEnabled = response.success;

      if (biometricEnabled) {
        // Store passcode and encrypted private key in keychain
        const username = String(passcode);

        // since private key can be absent and android doesn't support that...
        let pass = encryptedPKey;
        if (!pass) {
          pass = GLOBALS.CONSTANTS.NULL_EXCEPTION;
        }
        const password = String(pass);
        const AUTH_OPTIONS = {
          accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_CURRENT_SET,
          accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED,
        };

        await Keychain.setGenericPassword(username, password, AUTH_OPTIONS);
      }
    }
    await loadNextScreen();
    setIsSetupLoading(false);
  };

  const loadNextScreen = async () => {
    // Goto Next Screen
    // Check if the push notification permission is waiting for first grant
    // If not, skip this step completely as user either gave permission or denied it
    const authorizationStatus = await messaging().hasPermission();

    if (authorizationStatus === messaging.AuthorizationStatus.NOT_DETERMINED) {
      // @ts-ignore
      navigation.navigate(GLOBALS.SCREENS.PUSHNOTIFY);
    } else {
      await login();
    }
  };

  const textPrompt = useMemo(() => {
    return step === STEPS.ENTER_PASSCODE
      ? 'Pick a Passcode for your Vault'
      : 'Re-enter your passcode to confirm';
  }, [step]);

  const mappedPasscode = useMemo(() => {
    return step === STEPS.ENTER_PASSCODE ? passcode : passcodeMirror;
  }, [passcode, passcodeMirror, step]);

  const onboardingWrapperProps = useMemo(() => {
    if (step === STEPS.PASSCODE_CONFIRMED) {
      return {
        footerButtons: [
          {
            title: `Enable ${biometricType}`,
            disabled: !pkeyEncrypted,
            bgColor: GLOBALS.COLORS.PINK,
            fontColor: GLOBALS.COLORS.WHITE,
            loading: isSetupLoading,
            onPress: loadNextScreenAfterAdditionalSetup,
          },
          {
            title: 'Skip for now',
            bgColor: GLOBALS.COLORS.TRANSPARENT,
            fontColor: GLOBALS.COLORS.BLACK,
            disabled: !pkeyEncrypted,
            onPress: loadNextScreen,
          },
        ],
        title: `Enable ${biometricType} for fast and secure access.`,
      };
    } else {
      return {
        title: 'Set a passcode to protect your data.',
        subtitle:
          'Your passcode will be used to unlock the Push app on this device. The passcode cannot be recovered.',
      };
    }
  }, [step, biometricType, isSetupLoading]);

  return (
    <OnboardingWrapper
      backgroundColor="#F9F9F9"
      title={onboardingWrapperProps.title}
      subtitle={onboardingWrapperProps.subtitle}
      footerButtons={onboardingWrapperProps.footerButtons}>
      {step === STEPS.PASSCODE_CONFIRMED ? (
        <View style={styles.imageContainer}>
          {pkeyEncrypted ? (
            <Image source={require('assets/ui/biometric.png')} />
          ) : (
            <LoadingSpinner />
          )}
        </View>
      ) : (
        <>
          <View style={styles.textPromptContainer}>
            <Text style={styles.textPrompt}>{textPrompt}</Text>
          </View>
          <View style={styles.passcodeWrapper}>
            <PasscodeInput
              ref={inputRef}
              passcode={mappedPasscode}
              onChangeText={text => handleEnteredPasscode(text)}
            />
            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}
          </View>
        </>
      )}
    </OnboardingWrapper>
  );
};

export default BiometricScreen;

const styles = StyleSheet.create({
  passcodeWrapper: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
  },
  textPromptContainer: {
    alignItems: 'center',
    marginTop: 84,
    marginBottom: 24,
  },
  textPrompt: {
    color: '#3D3E45',
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 18,
    letterSpacing: -0.08,
  },
  imageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  errorContainer: {
    marginTop: 24,
  },
  errorText: {
    color: '#C51A1A',
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 18,
    letterSpacing: -0.08,
  },
});
