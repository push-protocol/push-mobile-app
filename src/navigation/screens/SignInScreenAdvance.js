import {useFocusEffect} from '@react-navigation/native';
import {Camera} from 'expo-camera';
import React, {useEffect, useState} from 'react';
import {
  Animated,
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
import DetailedInfoPresenter from 'src/components/misc/DetailedInfoPresenter';
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

export default props => {
  // Camera
  const [permission, requestPermission] = Camera.useCameraPermissions();
  const [transitionFinished, setTransitionFinished] = useState(false);
  const [detailedInfoPresetned, setDetailedInfoPresetned] = useState(false);

  const [fader] = useState(new Animated.Value(0));
  const [walletAddress, setWalletAddress] = useState('');
  const [privateKey, setPrivateKey] = useState('');

  const [cns, setCNS] = useState('');
  const [ens, setENS] = useState('');
  const [walletAddressVerified, setWalletAddressVerified] = useState(false);
  const dispatch = useDispatch();

  const NoticePromptRef = React.useRef();
  const QRScannerRef = React.useRef();
  const OverlayBlurRef = React.useRef();
  const TextEntryPromptRef = React.useRef();

  useEffect(() => {}, [walletAddressVerified]);

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
    console.log('its', NoticePromptRef.current);
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
  const toggleQRScanner = (toggle, navigation) => {
    QRScannerRef.current.changeRenderState(toggle, navigation);
  };

  // Users Permissions
  const getCameraPermissionAsync = async navigation => {
    // if permisson granted then proceed
    if (permission.granted) {
      toggleQRScanner(true, navigation);
    }

    // ask for the permission
    let {granted} = await requestPermission();
    if (granted) {
      toggleQRScanner(true, navigation);
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
  const onPrivateKeyDetect = code => {
    setPrivateKey(code);
  };

  const handleQRCodeFromDapp = code => {
    loadLoginFromDapp(code);
  };

  // Reset PK Code
  const resetPrivateKey = () => {
    setPrivateKey('');
    setWalletAddressVerified(false);
    // setFader(0);

    Animated.timing(fader, {
      toValue: 1,
      duration: 250,
      useNativeDriver: true,
    }).start();
  };

  // Handle Profile Info
  const profileInfoFetched = (wallet, _cns, _ens) => {
    setWalletAddress(wallet);
    setCNS(_cns);
    setENS(_ens);
    setWalletAddressVerified(true);
    // setFader(0);
    Animated.timing(fader, {
      toValue: 1,
      duration: 250,
      useNativeDriver: true,
    }).start();
  };

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
    dispatch(
      setInitialSignin({
        wallet: walletAddress,
        ensRefreshTime: new Date().getTime() / 1000, // Time in epoch
        cns: cns,
        ens: ens,
        index: 0,
      }),
    );
    // Goto Next Screen
    navigation.navigate(GLOBALS.SCREENS.BIOMETRIC, {
      wallet: walletAddress,
      privateKey: privateKey,
      fromOnboarding: props.route.params.fromOnboarding,
    });
  };

  const loadLoginFromDapp = async code => {
    // Goto Next Screen
    navigation.navigate(GLOBALS.SCREENS.SIGNINFROMDAPP, {
      code: code,
      navigation: navigation,
    });
  };

  // RETURN
  const {navigation} = props;
  // const {signInFlow} = props.route.params;

  return (
    <React.Fragment>
      <SafeAreaView style={styles.container}>
        <ScreenFinishedTransition
          setScreenTransitionAsDone={() => {
            setTransitionFinished(true);
          }}
        />

        <Text style={styles.header}>Advance Sign In!</Text>
        <View style={styles.inner}>
          {privateKey === '' ? (
            <DetailedInfoPresenter
              style={styles.intro}
              icon={require('assets/ui/walletadv.png')}
              contentView={
                <View style={styles.introContent}>
                  <StylishLabel
                    style={styles.para}
                    fontSize={16}
                    alignSelf="center"
                    title="[b:Import Existing Account] to sign in directly."
                  />

                  <StylishLabel
                    style={styles.paraend}
                    fontSize={16}
                    title={
                      'This is [b:not the recommeneded way] to sign in, you should only do it if you know what you are doing.\n\n[d:Note:] Your private key can be used by malicious apps to compromise you. [up:Learn about risks||https://www.coinbase.com/learn/crypto-basics/what-is-a-private-key] | [up:Verify our repo||https://github.com/ethereum-push-notification-service/epns-mobile-app]\n\n⚠️ Please enter your private key to continue.'
                    }
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
              profileKey={privateKey}
              profileType={GLOBALS.CONSTANTS.CRED_TYPE_PRIVATE_KEY}
              resetFunc={() => {
                resetPrivateKey();
              }}
              profileInfoFetchedFunc={(wallet, _cns, _ens) => {
                profileInfoFetched(wallet, _cns, _ens);
              }}
            />
          )}
        </View>
        <Animated.View style={[styles.footer, {opacity: fader}]}>
          {privateKey === '' ? (
            <View style={styles.entryFooter}>
              <PrimaryButton
                iconFactory="MaterialIcons"
                icon="qr-code-scanner"
                iconSize={24}
                title="Scan QR Code for Private Key"
                fontSize={16}
                fontColor={GLOBALS.COLORS.WHITE}
                bgColor={GLOBALS.COLORS.GRADIENT_SECONDARY}
                disabled={false}
                onPress={() => {
                  getCameraPermissionAsync(navigation);
                }}
              />

              <View style={styles.divider} />
              <View style={styles.columnizer}>
                <PrimaryButton
                  iconFactory="MaterialCommunityIcons"
                  icon="arrow-left"
                  iconSize={24}
                  iconAlignToLeft={true}
                  title="Back"
                  fontSize={16}
                  fontColor={GLOBALS.COLORS.WHITE}
                  bgColor={GLOBALS.COLORS.MID_GRAY}
                  disabled={false}
                  onPress={() => {
                    props.navigation.goBack();
                  }}
                />

                <View style={styles.colDivider} />

                <PrimaryButton
                  iconFactory="Ionicons"
                  icon="ios-code-working"
                  iconSize={24}
                  title="Enter Manually"
                  fontSize={16}
                  fontColor={GLOBALS.COLORS.WHITE}
                  bgColor={GLOBALS.COLORS.GRADIENT_THIRD}
                  disabled={false}
                  onPress={() => {
                    toggleTextEntryPrompt(true, true);
                  }}
                />
              </View>
            </View>
          ) : (
            <View style={styles.verifyFooter}>
              {walletAddressVerified && (
                <React.Fragment>
                  <PrimaryButton
                    iconFactory="Ionicons"
                    icon="ios-refresh"
                    iconSize={24}
                    title="Reset / Use Different Wallet"
                    fontSize={16}
                    fontColor={GLOBALS.COLORS.WHITE}
                    bgColor={GLOBALS.COLORS.GRADIENT_PRIMARY}
                    disabled={false}
                    onPress={() => {
                      resetPrivateKey();
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
                </React.Fragment>
              )}
            </View>
          )}

          <GetScreenInsets />
        </Animated.View>
      </SafeAreaView>

      <QRScanner
        ref={QRScannerRef}
        navigation={navigation}
        navHeader="Link Wallet Address"
        errorMessage="Ensure that it is a valid Eth private key QR"
        title="Scan your Eth private key to link your device to the push app"
        qrType={QR_TYPES.ETH_PK_SCAN}
        doneFunc={code => {
          onPrivateKeyDetect(code);
        }}
        // doneFunc={code => {
        //   handleQRCodeFromDapp(code);
        // }}
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
        title="Enter Private Key"
        subtitle="Please enter the Private Key of your Wallet. Remove 0x out if it starts with it, that is applied automatically."
        entryLimit={64}
        allowDomainDetection={false}
        doneTitle="Verify!"
        doneFunc={code => {
          code = '0x' + code;
          onPrivateKeyDetect(code);
        }}
        closeTitle="Cancel"
        closeFunc={() => toggleTextEntryPrompt(false, true)}
      />
    </React.Fragment>
  );
};

// Styling
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: GLOBALS.COLORS.WHITE,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  header: {
    fontSize: 32,
    fontWeight: 'bold',
    paddingTop: 40,
    paddingHorizontal: 20,
  },
  inner: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    top: -25,
    bottom: 0,
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
    marginBottom: 20,
  },
  paraend: {
    marginBottom: 0,
  },
  profile: {},
  footer: {
    width: '100%',
    paddingHorizontal: 20,
  },
  divider: {
    marginVertical: 10,
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
