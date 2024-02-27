import {Audio} from 'expo-av';
import {BarCodeScanningResult, Camera} from 'expo-camera';
import React, {useRef} from 'react';
import {
  Animated,
  Dimensions,
  Image,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {RNHoleView} from 'react-native-hole-view';
import GLOBALS from 'src/Globals';
import ErrorModalWrapper from 'src/components/misc/ErrorModalWrapper';
import {QRCodeVerification} from 'src/helpers/QRCodeValidator';

import useModalBlur from './useModalBlur';

const {height, width} = Dimensions.get('window');

interface QrScannerProps {
  qrType: string;
  qrWindowWidth?: number;
  qrWindowHeight?: number;
  qrBorderRadius?: number;
  doneFunc: (code: string) => Promise<void>;
  title: string;
}

const useQrScanner = ({
  qrType,
  qrBorderRadius = 28,
  qrWindowWidth = 184,
  qrWindowHeight = 184,
  doneFunc,
  title,
}: QrScannerProps) => {
  const fadeAnimation = useRef(new Animated.Value(0)).current;
  const [open, setOpen] = React.useState(false);
  const qrBorderWidth = qrWindowWidth + 40;
  const qrBorderHeight = qrWindowHeight + 40;

  const {
    showModal: showErrorModal,
    hideModal: hideErrorModal,
    ModalComponent: QRErrorModal,
  } = useModalBlur();

  const handleOpen = async () => {
    const permission = await Camera.requestCameraPermissionsAsync();
    if (permission.granted) setOpen(true);
    Animated.timing(fadeAnimation, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
    await playScanSound();
  };

  const handleClose = () => {
    Animated.timing(fadeAnimation, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true,
    }).start(() => {
      setOpen(false);
    });
  };

  const playScanSound = async () => {
    try {
      const {sound} = await Audio.Sound.createAsync(
        require('assets/sounds/scanned.mp3'),
      );
      await sound.playAsync();
    } catch (err) {}
  };

  const handleBarCodeScanned = async (scanned: BarCodeScanningResult) => {
    let code = scanned.data;

    const isValid = QRCodeVerification(code, qrType);
    if (!isValid) {
      showErrorModal();
      return;
    }

    handleClose();
    doneFunc(code);
  };

  const ScannerComponent = () => {
    return (
      <>
        <StatusBar
          barStyle="light-content"
          translucent={true}
          backgroundColor={'transparent'}
        />
        <QRErrorModal
          InnerComponent={ErrorModalWrapper}
          InnerComponentProps={{
            title: 'Invalid QR Code',
            subtitle: 'The QR code was not recognized',
            footerButtons: [
              {
                title: 'Ok',
                bgColor: GLOBALS.COLORS.BLACK,
                fontColor: GLOBALS.COLORS.WHITE,
                onPress: hideErrorModal,
              },
            ],
          }}
        />
        {open && (
          <Animated.View
            style={[
              styles.absoluteFill,
              {
                opacity: fadeAnimation,
              },
            ]}>
            <Camera
              onBarCodeScanned={handleBarCodeScanned}
              style={styles.absoluteFill}
            />
            <Text
              style={[
                styles.text,
                {top: (height - qrBorderHeight) / 2 - height / 5},
              ]}>
              {title}
            </Text>
            <View
              style={{
                width: qrBorderWidth,
                height: qrBorderHeight,
                position: 'absolute',
                zIndex: 1,
                top: (height - qrBorderHeight) / 2 + 5,
                left: (width - qrBorderWidth) / 2,
              }}>
              <Image
                source={require('assets/ui/qrscanborder.png')}
                resizeMode="contain"
              />
            </View>
            <RNHoleView
              style={styles.holeView}
              holes={[
                {
                  x: width / 2 - qrWindowWidth / 2,
                  y: height / 2 - qrWindowHeight / 2,
                  width: qrWindowWidth,
                  height: qrWindowHeight,
                  borderRadius: qrBorderRadius,
                },
              ]}
            />
          </Animated.View>
        )}
      </>
    );
  };

  return {
    isScannerOpen: open,
    showScanner: handleOpen,
    hideScanner: handleClose,
    ScannerComponent,
  };
};

export default useQrScanner;

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 12,
  },
  absoluteFill: {
    ...StyleSheet.absoluteFillObject,
  },
  holeView: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  text: {
    color: GLOBALS.COLORS.WHITE,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '600',
    lineHeight: 29,
    zIndex: 1,
    marginHorizontal: 52,
    ...StyleSheet.absoluteFillObject,
  },
});
