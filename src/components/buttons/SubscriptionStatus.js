import { serializeTransaction } from "ethers/lib/utils";
import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  Linking,
  StyleSheet,
  Modal,
  TouchableOpacity,
} from "react-native";
import { MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons";

import {
  useWalletConnect,
} from '@walletconnect/react-native-dapp';

import PrimaryButton from 'src/components/buttons/PrimaryButton';

import OverlayBlur from "src/components/modals/OverlayBlur";
import NoticePrompt from "src/components/modals/NoticePrompt";

import MetaStorage from "src/singletons/MetaStorage";

import ENV_CONFIG from "src/env.config";
import GLOBALS from 'src/Globals';

const CHANNEL_OPT_IN = 1;
const CHANNEL_OPT_OUT = 2;

const SubscriptionStatus = ({ channel, user, style }) => {
  const [subscribed, setSubscribed] = useState(null);

  const [modal, setModal] = useState(false);
  const [action, setAction] = useState("");

  const [processing, setProcessing] = useState(false);

  const apiURL =
    ENV_CONFIG.EPNS_SERVER + ENV_CONFIG.ENDPOINT_FETCH_SUBSCRIPTION;

  // Wallet Connect functionality
  const {
    createSession,
    killSession,
    session,
    signTransaction,
  } = useWalletConnect();
  const connector = useWalletConnect();

  // Setup Refs
  const OverlayBlurRef = useRef(null);
  const NoticePromptRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    if (isMounted) fetchSubscriptionStatus(user, channel);

    return () => {
      isMounted = false;
    };
  });

  const handleOpts = async (action) => {
    // Check signin flow
    setProcessing(true);

    const signedInType = await MetaStorage.instance.getSignedInType();
    if (signedInType === GLOBALS.CONSTANTS.CRED_TYPE_PRIVATE_KEY) {

    }
    else if (signedInType === GLOBALS.CONSTANTS.CRED_TYPE_WALLET) {
      // Check if wallet connect is active

    }

  }

  const showPopUp = async (action) => {
    // Check if Wallet Connect
    setModal(true);
    setAction(action);
  };

  const fetchSubscriptionStatus = async (user, channel) => {
    // console.log(apiURL);
    const response = await fetch(apiURL, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        subscriber: user,
        channel: channel,
        op: "read",
      }),
    });

    const subscriptionStatus = await response.json();

    // console.log(subscriptionStatus);

    setSubscribed(subscriptionStatus);
  };

  const openURL = async (url) => {
    // if (validURL(url) || 1) {
    // console.log("OPENING URL ", url);
    // Bypassing the check so that custom app domains can be opened
    await Linking.openURL(url);
    // Linking.canOpenURL(url).then((supported) => {
    //   if (supported) {
    //     Linking.openURL(url);
    //   } else {
    //     // showToast("Device Not Supported", "ios-link", ToasterOptions.TYPE.GRADIENT_PRIMARY)
    //   }
    // });
    // } else {
    // showToast("Link not valid", "ios-link", ToasterOptions.TYPE.GRADIENT_PRIMARY)
    // }
  };

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

  return (
    <View style={styles.container}>
      {subscribed == null &&
        <ActivityIndicator size={"small"} color={GLOBALS.COLORS.GRADIENT_PRIMARY} />
      }

      {subscribed != null && subscribed == true &&
        <PrimaryButton
          style={styles.controlPrimary}
          setButtonStyle={{borderRadius: 0, padding: 0}}
          iconFactory='MaterialCommunityIcons'
          icon='checkbox-marked'
          iconSize={24}
          fontSize={10}
          fontColor={GLOBALS.COLORS.WHITE}
          bgColor={GLOBALS.COLORS.GRADIENT_PRIMARY}
          setHeight='100%'
          disabled={processing}
          loading={processing}
          onPress={() => {handleOpts(CHANNEL_OPT_IN)}}
        />
      }

      {subscribed != null && subscribed == false &&
        <PrimaryButton
          style={styles.controlPrimary}
          setButtonStyle={{borderRadius: 0, padding: 0}}
          setButtonInnerStyle={{flexDirection: 'column-reverse'}}
          title="Opt In"
          iconFactory='MaterialCommunityIcons'
          icon='checkbox-blank-outline'
          iconSize={24}
          iconColor={GLOBALS.COLORS.BLACK}
          fontSize={10}
          fontColor={GLOBALS.COLORS.MID_BLACK_TRANS}
          bgColor={GLOBALS.COLORS.LIGHT_BLACK_TRANS}
          color={GLOBALS.COLORS.GRADIENT_PRIMARY}
          setHeight='100%'
          disabled={processing}
          loading={processing}
          onPress={() => {handleOpts(CHANNEL_OPT_OUT)}}
        />
      }

      {/* Overlay Blur and Notice to show in case permissions for camera aren't given */}
      <OverlayBlur ref={OverlayBlurRef}/>

      <NoticePrompt
        ref={NoticePromptRef}
        closeTitle="OK"
        closeFunc={() => toggleNoticePrompt(false, true)}
      />

      <Modal
        animationType="fade"
        transparent={true}
        visible={modal}
        onRequestClose={() => {
          setModal(!modal);
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>
              {action} is currently posible with Metamask. You will be
              redirected to the Metamask app where you can sign into our Dapp
              and carry out {action}.
            </Text>
            <TouchableOpacity
              style={styles.button1}
              onPress={() => openURL(ENV_CONFIG.METAMASK_LINK)}
            >
              <Text style={styles.textStyle}>
                Sign In with Metamask.{"  "}
                <FontAwesome5 name="external-link-alt" size={20} />{" "}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.button1}
              onPress={() => {initiateWalletConnect()}}
            >
              <Text style={styles.textStyle}>
                Sign In with Wallet Connect.{"  "}
                <FontAwesome5 name="external-link-alt" size={20} />{" "}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.buttonClose]}
              onPress={() => setModal(!modal)}
            >
              <Text style={styles.textStyle}>Close.</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
    justifyContent: "center",
  },
  controlPrimary: {
    flex: 1,
    maxHeight: '100%'
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
    backgroundColor: "rgba(255,255,255,0.75)",
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
    marginTop: 10,
  },
  button1: {
    borderRadius: 8,
    padding: 10,
    elevation: 2,
    backgroundColor: "#E20880",
  },
  buttonOpen: {
    backgroundColor: "#228bc6",
  },
  buttonClose: {
    backgroundColor: "#228bc6",
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
  },
});

export default SubscriptionStatus;
