import {useFocusEffect} from '@react-navigation/native';
import {useWalletConnect} from '@walletconnect/react-native-dapp';
import {Camera} from 'expo-camera';
import React, {useEffect, useRef, useState} from 'react';
import {
  Animated,
  Dimensions,
  InteractionManager,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {SafeAreaView, useSafeArea} from 'react-native-safe-area-context';
import {useDispatch} from 'react-redux';
import GLOBALS from 'src/Globals';
import PrimaryButton from 'src/components/buttons/PrimaryButton';
import StylishLabel from 'src/components/labels/StylishLabel';
import DetailedInfoSignIn from 'src/components/misc/DetailedInfoSignIn';
import NoticePrompt from 'src/components/modals/NoticePrompt';
import OverlayBlur from 'src/components/modals/OverlayBlur';
import PKEntryPrompt from 'src/components/modals/PKEntryPrompt';
import QRScanner from 'src/components/modals/QRScanner';
import PKProfileBuilder from 'src/components/web3/PKProfileBuilder';
import {QR_TYPES} from 'src/enums';
import {setInitialSignin} from 'src/redux/authSlice';

function ScreenFinishedTransition({setScreenTransitionAsDone}) {
  useFocusEffect(
    React.useCallback(() => {
      const task = InteractionManager.runAfterInteractions(() => {
        // After screen is loaded
        setScreenTransitionAsDone();
      });

      return () => task.cancel();
    }, []),
  );

  return null;
}

function GetScreenInsets() {
  const insets = useSafeArea();
  if (insets.bottom > 0) {
    // Adjust inset by
    return <View style={styles.insetAdjustment} />;
  } else {
    return <View style={styles.noInsetAdjustment} />;
  }
}

const windowHeight = Dimensions.get('window').height;

const SignInScreen = ({route, navigation}) => {
  // Camera
  const [permission, requestPermission] = Camera.useCameraPermissions();
  // Setup state
  const [transitionFinished, setTransitionFinished] = useState(false);
  const [detailedInfoPresetned, setDetailedInfoPresetned] = useState(false);

  const [fader] = useState(new Animated.Value(0));
  const [walletAddress, setWalletAddress] = useState('');

  const [cns, setCNS] = useState('');
  const [ens, setENS] = useState('');
  const [walletAddressVerified, setWalletAddressVerified] = useState('');
  const dispatch = useDispatch();
  // Wallet Connect functionality

  const connector = useWalletConnect();

  // Setup Refs
  const QRScannerRef = useRef(null);
  const OverlayBlurRef = useRef(null);
  const NoticePromptRef = useRef(null);
  const TextEntryPromptRef = useRef(null);

  // FUNCTIONS
  // Open Notice Prompt With Overlay Blur
  const toggleNoticePrompt = (
    toggle,
    animate,
    title,
    subtitle,
    notice,
    showIndicator,
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

  // Open Text Prompt With Overlay Blur
  const toggleTextEntryPrompt = (toggle, animate) => {
    // Set render state of this and the animate the blur modal in
    OverlayBlurRef.current.changeRenderState(toggle, animate);
    TextEntryPromptRef.current.changeRenderState(toggle, animate);
  };

  // Open QR Scanner
  const toggleQRScanner = (_toggle, _navigation) => {
    QRScannerRef.current.changeRenderState(_toggle, _navigation);
  };

  // Users Permissions
  const getCameraPermissionAsync = async _navigation => {
    // if permisson granted then proceed
    if (permission.granted) {
      toggleQRScanner(true, _navigation);
    }

    // ask for the permission
    let {granted} = await requestPermission();
    if (granted) {
      toggleQRScanner(true, _navigation);
    }

    // ask user explicitly to enable the camera
    toggleNoticePrompt(
      true,
      true,
      'Camera Access',
      'Need Camera Permissions for scanning QR Code',
      'Please enable Camera Permissions from [appsettings:App Settings] to continue',
      false,
    );
  };

  // Detect PK Code
  const onWalletDetect = code => {
    setWalletAddress(code);
  };

  // Reset PK Code
  const resetWalletAddress = () => {
    // Kill Wallet Conenct
    if (connector.connected) {
      connector.killSession();
    }

    setWalletAddress('');
    setWalletAddressVerified(false);
    Animated.timing(fader, {
      toValue: 1,
      duration: 250,
      useNativeDriver: true,
    }).start();
  };

  // Handle Profile Info
  const profileInfoFetched = (_wallet, _cns, _ens) => {
    setWalletAddress(_wallet);
    setCNS(_cns);
    setENS(_ens);
    setWalletAddressVerified(true);
  };

  useEffect(() => {
    if (walletAddressVerified && walletAddress) {
      Animated.timing(fader, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [walletAddress, walletAddressVerified]);

  useEffect(() => {
    if (connector.connected) {
      setWalletAddress(connector.accounts[0]);
    }
  }, [connector.connected]);

  // When Animation is Finished
  const animationFinished = () => {
    setDetailedInfoPresetned(true);
    Animated.timing(fader, {
      toValue: 1,
      duration: 250,
      useNativeDriver: true,
    }).start();
  };

  // Load the Next Screen
  const loadNextScreen = async () => {
    // Store ENS and Wallet in Redux Storage and then move ahead

    dispatch(
      setInitialSignin({
        wallet: walletAddress,
        userPKey: '',
        ensRefreshTime: new Date().getTime() / 1000, // Time in epoch
        cns: cns,
        ens: ens,
        index: 0,
      }),
    );

    // Goto Next Screen
    navigation.navigate(GLOBALS.SCREENS.BIOMETRIC);
  };

  // Load Advvance Screen
  const loadAdvanceScreen = async () => {
    console.log(route);
    // Goto Next Screen
    navigation.navigate(GLOBALS.SCREENS.SIGNINADVANCE, {
      wallet: walletAddress,
    });
  };

  return (
    <>
      <SafeAreaView style={styles.container}>
        <ScreenFinishedTransition
          setScreenTransitionAsDone={() => {
            setTransitionFinished(true);
          }}
        />

        <Text style={styles.header}>Wallet Address</Text>
        <View style={styles.inner}>
          {walletAddress === '' ? (
            <DetailedInfoSignIn
              style={styles.intro}
              icon={require('assets/ui/wallet.png')}
              contentView={
                <View style={styles.introContent}>
                  <StylishLabel
                    style={styles.para}
                    fontSize={16}
                    title="[b:Push (EPNS)] requires your wallet address to deliver [d:notifications] meant for you!"
                    textStyle={{lineHeight: 22}}
                  />
                </View>
              }
              animated={!detailedInfoPresetned}
              startAnimation={transitionFinished}
              animationCompleteCallback={() => {
                animationFinished();
              }}
            />
          ) : (
            <PKProfileBuilder
              style={styles.profile}
              profileKey={walletAddress}
              profileType={GLOBALS.CONSTANTS.CRED_TYPE_WALLET}
              resetFunc={() => {
                resetWalletAddress();
              }}
              profileInfoFetchedFunc={(_wallet, _cns, _ens) => {
                profileInfoFetched(_wallet, _cns, _ens);
              }}
            />
          )}
        </View>

        <Animated.View style={[styles.footer, {opacity: fader}]}>
          {walletAddress === '' ? (
            <View style={styles.entryFooter}>
              <PrimaryButton
                iconFactory="Image"
                icon={require('assets/ui/walletConnect.png')}
                iconSize={24}
                title={!connector.connected ? 'WalletConnect' : 'Disconnect'}
                fontSize={18}
                fontColor={GLOBALS.COLORS.WHITE}
                bgColor={GLOBALS.COLORS.BLACK}
                setHeight={55}
                disabled={false}
                onPress={() => {
                  if (connector.connected) {
                    connector.killSession();
                  } else {
                    connector.connect();
                  }
                }}
                iconFirst
              />

              <View style={styles.divider} />

              <PrimaryButton
                iconFactory="MaterialIcons"
                icon="qr-code-scanner"
                iconSize={24}
                title="Login With Push Chat"
                fontSize={16}
                fontColor={GLOBALS.COLORS.WHITE}
                bgColor={GLOBALS.COLORS.GRADIENT_PRIMARY}
                setHeight={55}
                disabled={false}
                onPress={() => {
                  navigation.navigate(GLOBALS.SCREENS.LOG_IN_DAPP_INFO);
                }}
                iconFirst
              />

              <View style={styles.divider} />

              <PrimaryButton
                iconFactory="MaterialIcons"
                icon="qr-code-scanner"
                iconSize={24}
                title="Scan Wallet Address"
                setHeight={55}
                fontSize={16}
                fontColor={GLOBALS.COLORS.BLACK}
                bgColor={GLOBALS.COLORS.WHITE}
                iconColor={GLOBALS.COLORS.MID_GRAY}
                borderColor={GLOBALS.COLORS.MID_GRAY}
                disabled={false}
                onPress={() => {
                  getCameraPermissionAsync(navigation);
                }}
                iconFirst={true}
              />

              <View style={styles.divider} />
              <View style={styles.divider} />
              <View style={styles.divider} />

              <View style={styles.columnizer}>
                <PrimaryButton
                  iconFactory="Image"
                  icon={require('assets/ui/pencil_logo.png')}
                  iconSize={24}
                  title="Enter Manually"
                  fontSize={14}
                  fontColor={GLOBALS.COLORS.BLACK}
                  bgColor={'#EDEDEE'}
                  disabled={false}
                  iconFirst={true}
                  onPress={() => {
                    toggleTextEntryPrompt(true, true);
                  }}
                  iconColor={GLOBALS.COLORS.GRADIENT_PRIMARY}
                  setHeight={54}
                />

                <View style={styles.colDivider} />

                <PrimaryButton
                  iconFactory="Image"
                  icon={require('assets/ui/advanced_logo.png')}
                  iconSize={24}
                  title="Advanced"
                  fontSize={14}
                  fontColor={GLOBALS.COLORS.BLACK}
                  bgColor={'#EDEDEE'}
                  disabled={false}
                  iconFirst={true}
                  iconColor={GLOBALS.COLORS.GRADIENT_PRIMARY}
                  setHeight={54}
                  onPress={() => {
                    loadAdvanceScreen();
                  }}
                />
              </View>
            </View>
          ) : (
            <View style={styles.verifyFooter}>
              {walletAddressVerified === false ? null : (
                <>
                  <PrimaryButton
                    iconFactory="Ionicons"
                    icon="ios-refresh"
                    iconSize={24}
                    title="Reset / Use Different Wallest"
                    fontSize={16}
                    fontColor={GLOBALS.COLORS.WHITE}
                    bgColor={GLOBALS.COLORS.GRADIENT_PRIMARY}
                    disabled={false}
                    onPress={() => {
                      resetWalletAddress();
                    }}
                  />
                  <View style={styles.divider} />

                  <PrimaryButton
                    iconFactory="Ionicons"
                    icon="ios-arrow-forward"
                    iconSize={24}
                    title="Continue"
                    fontSize={16}
                    fontColor={GLOBALS.COLORS.WHITE}
                    bgColor={GLOBALS.COLORS.GRADIENT_THIRD}
                    disabled={false}
                    onPress={() => {
                      loadNextScreen();
                    }}
                  />
                </>
              )}
            </View>
          )}

          <GetScreenInsets />
        </Animated.View>

        <QRScanner
          ref={QRScannerRef}
          navigation={navigation}
          navHeader="Link Wallet Address"
          errorMessage="Ensure that it is a valid Eth address QR"
          title="Scan your Eth wallet address to link your device to the push app"
          qrType={QR_TYPES.ETH_ADDRESS_SCAN}
          doneFunc={code => {
            onWalletDetect(code);
          }}
          closeFunc={() => toggleQRScanner(false, navigation)}
        />

        {/* Overlay Blur and Notice to show in case permissions for camera aren't given */}
        <OverlayBlur ref={OverlayBlurRef} />

        <NoticePrompt
          ref={NoticePromptRef}
          closeTitle="OK"
          closeFunc={() => toggleNoticePrompt(false, true)}
        />

        <PKEntryPrompt
          ref={TextEntryPromptRef}
          title="Enter Wallet Address"
          subtitle="Please enter your wallet address whose notification you want to receive."
          entryLimit={42}
          allowDomainDetection={true}
          doneTitle="Verify!"
          doneFunc={code => {
            onWalletDetect(code);
          }}
          closeTitle="Cancel"
          closeFunc={() => toggleTextEntryPrompt(false, true)}
        />
      </SafeAreaView>
    </>
  );
};

// Styling
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: GLOBALS.COLORS.WHITE,
    alignItems: 'stretch',
    justifyContent: 'space-between',
  },
  header: {
    fontSize: 28,
    fontWeight: '700',
    paddingTop: 40,
    alignSelf: 'center',
    paddingHorizontal: 20,
  },
  inner: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    top: windowHeight * 0.14,
    padding: 20,
    maxWidth: 540,
  },
  intro: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  introContent: {
    marginTop: 20,
  },
  para: {
    paddingHorizontal: 30,
  },

  paraend: {
    marginBottom: 0,
  },
  profile: {},
  footer: {
    paddingHorizontal: 34,
  },
  divider: {
    marginVertical: 6,
    width: '100%',
  },
  columnizer: {
    flexDirection: 'row',
  },
  colDivider: {
    marginHorizontal: 10,
    height: '100%',
  },
  insetAdjustment: {
    paddingBottom: 5,
  },
  noInsetAdjustment: {
    paddingBottom: 20,
  },
});

export default SignInScreen;
