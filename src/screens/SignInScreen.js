import React, { useState, useRef } from "react";
import {
  View,
  Text,
  Image,
  InteractionManager,
  Animated,
  StyleSheet,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { SafeAreaView, useSafeArea } from "react-native-safe-area-context";

import * as Permissions from "expo-permissions";

import {
  useWalletConnect,
  withWalletConnect,
  RenderQrcodeModalProps,
  WalletService,
} from '@walletconnect/react-native-dapp';

import StylishLabel from "src/components/labels/StylishLabel";
import DetailedInfoPresenter from "src/components/misc/DetailedInfoPresenter";
import PrimaryButton from "src/components/buttons/PrimaryButton";

import OverlayBlur from "src/components/modals/OverlayBlur";
import NoticePrompt from "src/components/modals/NoticePrompt";
import PKEntryPrompt from "src/components/modals/PKEntryPrompt";
import QRScanner from "src/components/modals/QRScanner";

import PKProfileBuilder from "src/components/web3/PKProfileBuilder";

import MetaStorage from "src/singletons/MetaStorage";

import GLOBALS from "src/Globals";

function ScreenFinishedTransition({ setScreenTransitionAsDone }) {
  useFocusEffect(
    React.useCallback(() => {
      const task = InteractionManager.runAfterInteractions(() => {
        // After screen is loaded
        setScreenTransitionAsDone();
      });

      return () => task.cancel();
    }, [])
  );

  return null;
}

function GetScreenInsets() {
  const insets = useSafeArea();
  if (insets.bottom > 0) {
    // Adjust inset by
    return <View style={styles.insetAdjustment}></View>;
  } else {
    return <View style={styles.noInsetAdjustment}></View>;
  }
}

const SignInScreen = ({ style, route, navigation }) => {
  // Setup state
  const [transitionFinished, setTransitionFinished] = useState(false);
  const [detailedInfoPresetned, setDetailedInfoPresetned] = useState(false);

  const [fader, setFader] = useState(new Animated.Value(0));
  const [walletAddress, setWalletAddress] = useState("");
  const [wallet, setWallet] = useState("");
  const [cns, setCNS] = useState("");
  const [ens, setENS] = useState("");
  const [walletAddressVerified, setWalletAddressVerified] = useState("");

  // Wallet Connect functionality
  const {
    createSession,
    killSession,
    session,
    signTransaction,
  } = useWalletConnect();
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
    showIndicator
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
  const toggleQRScanner = (toggle, navigation) => {
    QRScannerRef.current.changeRenderState(toggle, navigation);
  };

  // Users Permissions
  const getCameraPermissionAsync = async (navigation) => {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    if (status !== "granted") {
      toggleNoticePrompt(
        true,
        true,
        "Camera Access",
        "Need Camera Permissions for scanning QR Code",
        "Please enable Camera Permissions from [appsettings:App Settings] to continue",
        false
      );
    } else {
      // All Clear, open QR Scanner
      toggleQRScanner(true, navigation);
    }
  };

  // Detect PK Code
  const onWalletDetect = (code) => {
    setWalletAddress(code)
  };

  // Reset PK Code
  const resetWalletAddress = () => {
    setWalletAddress("")
    setWalletAddressVerified(false)
    Animated.timing(fader, {
      toValue: 1,
      duration: 250,
      useNativeDriver: true,
    }).start();
  };

  // Handle Profile Info
  const profileInfoFetched = (wallet, cns, ens) => {
    setWalletAddress(wallet)
    setCNS(cns)
    setENS(ens)
    setWalletAddressVerified(true)
    Animated.timing(fader, {
      toValue: 1,
      duration: 250,
      useNativeDriver: true,
    }).start();
  };

  // When Animation is Finished
  const animationFinished = () => {
    setDetailedInfoPresetned(true)
    Animated.timing(fader, {
      toValue: 1,
      duration: 250,
      useNativeDriver: true,
    }).start();
  };

  // Load the Next Screen
  const loadNextScreen = async () => {
    // Store ENS and Wallet in Storage and then move ahead
    const walletObj = {
      ensRefreshTime: new Date().getTime() / 1000, // Time in epoch
      cns: cns,
      ens: ens,
      wallet: wallet,
    };
    // console.log(walletObj);

    await MetaStorage.instance.setStoredWallet(walletObj);

    // Goto Next Screen
    navigation.navigate("Biometric", {
      wallet: walletAddress,
      fromOnboarding: route.params.fromOnboarding,
    });
  };

  // Load Advvance Screen
  const loadAdvanceScreen = async () => {
    // Goto Next Screen
    navigation.navigate("SignInAdvance", {
      wallet: wallet,
      fromOnboarding: route.params.fromOnboarding,
    });
  };

  const connectViaWalletConnect = async () => {
    connector.createSession();
  }

  return (
    <>
      <SafeAreaView style={styles.container}>
        <ScreenFinishedTransition
          setScreenTransitionAsDone={() => {
            setTransitionFinished(true)
          }}
        />

        <Text style={styles.header}>Wallet Address!</Text>
        <View style={styles.inner}>
          {walletAddress === "" ? (
            <DetailedInfoPresenter
              style={styles.intro}
              icon={require("assets/ui/wallet.png")}
              contentView={
                <View style={styles.introContent}>
                  <StylishLabel
                    style={styles.para}
                    fontSize={16}
                    title="[b:EPNS] requires your wallet address to deliver [d:notifications] meant for you!"
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
              profileInfoFetchedFunc={(wallet, cns, ens) => {
                profileInfoFetched(wallet, cns, ens);
              }}
            />
          )}
        </View>
        <Animated.View style={[styles.footer, { opacity: fader }]}>
          {walletAddress === "" ? (
            <View style={styles.entryFooter}>
              <PrimaryButton
                iconFactory="Image"
                icon={require('assets/ui/walletConnect.png')}
                iconSize={24}
                title="WalletConnect"
                fontSize={16}
                fontColor={GLOBALS.COLORS.WHITE}
                bgColor={GLOBALS.COLORS.GRADIENT_PRIMARY}
                disabled={false}
                onPress={() => {
                  connectViaWalletConnect();
                }}
              />

              <View style={styles.divider}></View>

              <PrimaryButton
                iconFactory="Ionicons"
                icon="ios-qr-scanner"
                iconSize={24}
                title="Scan via QR Code"
                fontSize={16}
                fontColor={GLOBALS.COLORS.WHITE}
                bgColor={GLOBALS.COLORS.GRADIENT_SECONDARY}
                disabled={false}
                onPress={() => {
                  getCameraPermissionAsync(navigation);
                }}
              />

              <View style={styles.divider}></View>

              <View style={styles.columnizer}>
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

                <View style={styles.colDivider}></View>

                <PrimaryButton
                  iconFactory="Ionicons"
                  icon="ios-menu"
                  iconSize={24}
                  title="Advance"
                  fontSize={16}
                  fontColor={GLOBALS.COLORS.WHITE}
                  bgColor={GLOBALS.COLORS.BLACK}
                  disabled={false}
                  onPress={() => {
                    loadAdvanceScreen();
                  }}
                />
              </View>
            </View>
          ) : (
            <View style={styles.verifyFooter}>
              {walletAddressVerified == false ? null : (
                <>
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
                      resetWalletAddress();
                    }}
                  />
                  <View style={styles.divider}></View>

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
          title="[wb:Please scan your] [d:wallet's address] [wb:to connect it to EPNS.]"
          doneFunc={(code) => {
            onWalletDetect(code);
          }}
          closeFunc={() => toggleQRScanner(false, navigation)}
        />

        {/* Overlay Blur and Notice to show in case permissions for camera aren't given */}
        <OverlayBlur ref={OverlayBlurRef}/>

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
          doneFunc={(code) => {
            onWalletDetect(code);
          }}
          closeTitle="Cancel"
          closeFunc={() => toggleTextEntryPrompt(false, true)}
        />
      </SafeAreaView>
    </>
  );
}

// Styling
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: GLOBALS.COLORS.WHITE,
    alignItems: "stretch",
    justifyContent: "space-between",
  },
  header: {
    fontSize: 32,
    fontWeight: "bold",
    paddingTop: 40,
    paddingHorizontal: 20,
    alignSelf: "center",
  },
  inner: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    top: 0,
    bottom: 0,
    padding: 20,
    maxWidth: 540,
  },
  intro: {
    alignItems: "center",
    justifyContent: "center",
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
    paddingHorizontal: 20,
  },
  divider: {
    marginVertical: 10,
    width: "100%",
  },
  columnizer: {
    flexDirection: "row",
  },
  colDivider: {
    marginHorizontal: 10,
    height: "100%",
  },
  insetAdjustment: {
    paddingBottom: 5,
  },
  noInsetAdjustment: {
    paddingBottom: 20,
  },
});

export default SignInScreen;
