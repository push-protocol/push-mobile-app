import {useNavigation} from '@react-navigation/native';
import {Camera} from 'expo-camera';
import React from 'react';
import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useSelector} from 'react-redux';
import GLOBALS from 'src/Globals';
import NoticePrompt from 'src/components/modals/NoticePrompt';
import OverlayBlur from 'src/components/modals/OverlayBlur';
import {QR_TYPES} from 'src/enums';
import envConfig from 'src/env.config';
import {selectAuthState} from 'src/redux/authSlice';

const DappScanPage = () => {
  const navigation = useNavigation();
  const authState = useSelector(selectAuthState);
  const NoticePromptRef = React.useRef<any>();
  const OverlayBlurRef = React.useRef<any>();

  const [permission, requestPermission] = Camera.useCameraPermissions();

  // toggleQRScanner(true);
  const qrScreen =
    authState === GLOBALS.AUTH_STATE.AUTHENTICATED
      ? GLOBALS.SCREENS.QRScanScreenFromLogin
      : GLOBALS.SCREENS.QRScanScreen;

  // FUNCTIONS
  // Open Notice Prompt With Overlay Blur
  const toggleNoticePrompt = (
    toggle: boolean,
    animate: boolean,
    title: string,
    subtitle: string,
    notice: string,
    showIndicator: boolean,
  ) => {
    // Set Notice First
    NoticePromptRef.current.changeTitle(title);
    NoticePromptRef.current.changeSubtitle(subtitle);
    NoticePromptRef.current.changeNotice(notice);
    NoticePromptRef.current.changeIndicator(showIndicator);
    // Set render state of this and the animate the blur modal in
    OverlayBlurRef.current.changeRenderState(toggle, animate);
    NoticePromptRef.current.changeRenderState(toggle, animate);
  };

  return (
    <View
      style={
        authState === GLOBALS.AUTH_STATE.AUTHENTICATED
          ? styles.container
          : styles.containerNoLogin
      }>
      <Image source={require('assets/ui/pgp_dapp.png')} style={styles.image} />
      <View style={styles.textContainer}>
        <Text style={styles.textHeader}>To use Push Chat on mobile</Text>
        <View style={{marginTop: 10, paddingHorizontal: 4}}>
          <View style={{display: 'flex', flexDirection: 'row'}}>
            <Text style={styles.lowerTextContainer}>1.</Text>
            <Text style={styles.lowerTextContainer}>
              Go to {envConfig.DAPP_URL} in your computer
            </Text>
          </View>
          <View
            style={{
              marginVertical: 12,
              display: 'flex',
              flexDirection: 'row',
            }}>
            <Text style={styles.lowerTextContainer}>2.</Text>
            <Text style={styles.lowerTextContainer}>
              Open Push Chat and click on ⋮ next to your user profile
            </Text>
          </View>

          <View style={{display: 'flex', flexDirection: 'row'}}>
            <Text style={styles.lowerTextContainer}>3.</Text>
            <Text style={styles.lowerTextContainer}>
              Click on Link Mobile App and scan the code
            </Text>
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={{width: '100%', alignItems: 'center', overflow: 'hidden'}}>
        <Text
          style={styles.button}
          onPress={async () => {
            if (!permission?.granted) {
              let {granted} = await requestPermission();
              if (!granted) {
                // ask user explicitly to enable the camera
                toggleNoticePrompt(
                  true,
                  true,
                  'Camera Access',
                  'Need Camera Permissions for scanning QR Code',
                  'Please enable Camera Permissions from [appsettings:App Settings] to continue',
                  false,
                );
                return;
              }
            }

            // @ts-ignore
            navigation.navigate(qrScreen, {
              navHeader: 'Link Push Chat',
              errorMessage: `Ensure that it is a valid code from ${envConfig.DAPP_URL}`,
              title: `Scan the form ${envConfig.DAPP_URL} to link your device to push chat`,
              qrType: QR_TYPES.DAPP_PGP_SCAN,
              authState: authState,
            });
          }}>
          Link Push chat
        </Text>
      </TouchableOpacity>

      {/* Overlay Blur and Notice to show in case permissions for camera aren't given */}
      <OverlayBlur ref={OverlayBlurRef} />
      <NoticePrompt
        ref={NoticePromptRef}
        closeTitle="OK"
        closeFunc={() => toggleNoticePrompt(false, true, '', '', '', false)}
      />
    </View>
  );
};

const windowHeight = Dimensions.get('window').height;
const styles = StyleSheet.create({
  container: {
    marginTop: '4%',
    paddingHorizontal: 25,
    paddingVertical: windowHeight * 0.01,
    alignItems: 'center',
  },
  containerNoLogin: {
    marginTop: '10%',
    paddingHorizontal: 25,
    paddingVertical: windowHeight * 0.04,
    alignItems: 'center',
  },
  textContainer: {
    alignItems: 'flex-start',
    width: '100%',
    marginTop: 10,
    paddingHorizontal: 21,
    paddingVertical: 17,
  },
  textHeader: {
    textAlign: 'center',
    width: '100%',
    fontSize: 18,
    fontWeight: '500',
    color: '#333333',
    marginBottom: 20,
  },
  lowerTextContainer: {
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 24,
  },
  image: {
    width: 250,
    height: 250,
    aspectRatio: 1,
    resizeMode: 'contain',
    paddingVertical: 20,
  },
  button: {
    marginTop: 18,
    backgroundColor: '#CF1C84',
    color: 'white',
    width: '80%',
    borderRadius: 15,
    overflow: 'hidden',
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '500',
    paddingVertical: 16,
  },
});

export {DappScanPage};
