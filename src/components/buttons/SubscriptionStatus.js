import {FontAwesome5} from '@expo/vector-icons';
import {useWalletConnectModal} from '@walletconnect/modal-react-native';
import {ethers} from 'ethers';
import React, {useEffect, useRef, useState} from 'react';
import {
  ActivityIndicator,
  Linking,
  Modal,
  StyleSheet,
  Text,
  TouchableHighlight,
  View,
} from 'react-native';
import Globals from 'src/Globals';
import GLOBALS from 'src/Globals';
import PrimaryButton from 'src/components/buttons/PrimaryButton';
import NoticePrompt from 'src/components/modals/NoticePrompt';
import OverlayBlur from 'src/components/modals/OverlayBlur';
import ENV_CONFIG from 'src/env.config';
import MetaStorage from 'src/singletons/MetaStorage';
import {handleChannelSub} from 'src/walletconnect';

const CHANNEL_OPT_IN = 1;
const CHANNEL_OPT_OUT = 2;

const SubscriptionStatus = ({channel, user, style, pKey}) => {
  const [subscribed, setSubscribed] = useState(null);

  const wc_connector = useWalletConnectModal();
  const [modal, setModal] = useState(false);
  const [action, setAction] = useState('');

  const [processing, setProcessing] = useState(false);

  const apiURL =
    ENV_CONFIG.EPNS_SERVER + ENV_CONFIG.ENDPOINT_FETCH_SUBSCRIPTION;

  const EPNS_DOMAIN = {
    name: 'EPNS COMM V1',
    chainId: ENV_CONFIG.CHAIN_ID,
    verifyingContract: Globals.CONTRACTS.COMM_CONTRACT,
  };

  const subType = {
    Subscribe: [
      {name: 'channel', type: 'address'},
      {name: 'subscriber', type: 'address'},
      {name: 'action', type: 'string'},
    ],
  };
  const unsubType = {
    Unsubscribe: [
      {name: 'channel', type: 'address'},
      {name: 'unsubscriber', type: 'address'},
      {name: 'action', type: 'string'},
    ],
  };

  const subMessage = {
    channel: channel,
    subscriber: user,
    action: 'Subscribe',
  };

  const unsubMessage = {
    channel: channel,
    unsubscriber: user,
    action: 'Unsubscribe',
  };

  const handleSubscribe = async () => {
    if (pKey !== '') {
      const signer = new ethers.Wallet(pKey);
      signer._signTypedData(EPNS_DOMAIN, subType, subMessage).then(res => {
        offChainSubscribe(res);
      });
    } else {
      showPopUp();
    }
  };

  const handleUnsubscribe = async () => {
    if (pKey !== '') {
      const signer = new ethers.Wallet(pKey);
      signer._signTypedData(EPNS_DOMAIN, unsubType, unsubMessage).then(res => {
        offChainUnsubscribe(res);
      });
    } else {
      showPopUp();
    }
  };

  const offChainSubscribe = async signature => {
    const apiUrl =
      ENV_CONFIG.EPNS_SERVER + ENV_CONFIG.ENDPOINT_SUBSCRIBE_OFFCHAIN;

    const body = {
      signature: signature,
      message: subMessage,
      contractAddress: Globals.CONTRACTS.COMM_CONTRACT,
      chainId: ENV_CONFIG.CHAIN_ID,
      op: 'write',
    };

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const subscribeResponse = await response.json();
    console.log('subscribeResponse', subscribeResponse);

    fetchSubscriptionStatus(user, channel);
  };

  const offChainUnsubscribe = async signature => {
    const apiUrl =
      ENV_CONFIG.EPNS_SERVER + ENV_CONFIG.ENDPOINT_UNSUBSCRIBE_OFFCHAIN;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        signature: signature,
        message: unsubMessage,
        contractAddress: Globals.CONTRACTS.COMM_CONTRACT,
        chainId: ENV_CONFIG.CHAIN_ID,
        op: 'write',
      }),
    });

    const unsubscribeResponse = await response.json();
    console.log('unsubscribeRespone', unsubscribeResponse);

    fetchSubscriptionStatus(user, channel);
  };

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

  const handleOpts = async action => {
    // Check signin flow
    setProcessing(true);
    const isWalletConnect = wc_connector.isConnected;
    const signedInType = await MetaStorage.instance.getSignedInType();
    if (isWalletConnect) {
      try {
        const done = await handleChannelSub(
          wc_connector.provider,
          action,
          channel,
        );
        if (done) {
          setSubscribed(prev => !prev);
        }
      } catch (error) {
        console.log(error);
      }
    } else if (signedInType === GLOBALS.CONSTANTS.CRED_TYPE_PRIVATE_KEY) {
      if (action === 1) {
        handleSubscribe();
      } else if (action === 2) {
        handleUnsubscribe();
      }
    } else {
      console.log('Not connected, opening wallet connect modal');
      wc_connector.open();
    }
  };

  const showPopUp = async action => {
    // Check if Wallet Connect
    setModal(true);

    if (action === 1) {
      setAction('Opt-In');
    } else if (action === 2) {
      setAction('Opt-Out');
    }
  };

  const fetchSubscriptionStatus = async (user, channel) => {
    const response = await fetch(apiURL, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subscriber: user,
        channel: channel,
        op: 'read',
      }),
    });
    const subscriptionStatus = await response.json();
    setProcessing(false);
    setSubscribed(subscriptionStatus);
  };

  const openURL = async url => {
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

  return (
    <View style={styles.container}>
      {subscribed == null && (
        <ActivityIndicator
          size={'small'}
          color={GLOBALS.COLORS.GRADIENT_PRIMARY}
        />
      )}

      {subscribed != null && subscribed === true && (
        <PrimaryButton
          style={styles.controlPrimary}
          setButtonStyle={{borderRadius: 0, padding: 0}}
          iconFactory="MaterialCommunityIcons"
          icon="checkbox-marked"
          iconSize={24}
          fontSize={10}
          fontColor={GLOBALS.COLORS.WHITE}
          bgColor={GLOBALS.COLORS.GRADIENT_PRIMARY}
          setHeight="100%"
          disabled={processing}
          loading={processing}
          onPress={() => {
            handleOpts(CHANNEL_OPT_OUT);
          }}
        />
      )}

      {subscribed !== null && subscribed === false && (
        <PrimaryButton
          style={styles.controlPrimary}
          setButtonStyle={{borderRadius: 0, padding: 0}}
          setButtonInnerStyle={{flexDirection: 'column-reverse'}}
          title="Opt In"
          iconFactory="MaterialCommunityIcons"
          icon="checkbox-blank-outline"
          iconSize={24}
          iconColor={GLOBALS.COLORS.BLACK}
          fontSize={10}
          fontColor={GLOBALS.COLORS.MID_BLACK_TRANS}
          bgColor={GLOBALS.COLORS.LIGHT_BLACK_TRANS}
          color={GLOBALS.COLORS.GRADIENT_PRIMARY}
          setHeight="100%"
          disabled={processing}
          loading={processing}
          onPress={() => {
            handleOpts(CHANNEL_OPT_IN);
          }}
        />
      )}

      {/* Overl
      ay Blur and Notice to show in case permissions for camera aren't given */}
      <OverlayBlur ref={OverlayBlurRef} />

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
        }}>
        <View style={styles.centeredView}>
          <View style={styles.modal}>
            <View style={[styles.optionsArea]}>
              <Text style={styles.textStyle}>
                {action} is currently posible with MetaMask. You will be
                redirected to the MetaMask app where you can sign into our Dapp
                and {action} to the channels of your choice.
              </Text>
            </View>

            <View style={[styles.doneArea]}>
              <TouchableHighlight
                style={[styles.done]}
                underlayColor={GLOBALS.COLORS.LIGHT_GRAY}
                onPress={() => openURL(ENV_CONFIG.METAMASK_LINK)}>
                <Text style={styles.doneText}>
                  Opt In with MetaMask {'  '}
                  <FontAwesome5 name="external-link-alt" size={20} />
                </Text>
              </TouchableHighlight>
            </View>
            <View style={[styles.cancelArea]}>
              <TouchableHighlight
                style={[styles.cancel]}
                underlayColor={GLOBALS.COLORS.LIGHT_GRAY}
                onPress={() => setModal(!modal)}>
                <Text style={[styles.cancelText]}>Cancel</Text>
              </TouchableHighlight>
            </View>
          </View>
        </View>
      </Modal>

      {/* <Modal
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
              onPress={() => {
                initiateWalletConnect();
              }}
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
      </Modal> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
    justifyContent: 'center',
  },
  controlPrimary: {
    flex: 1,
    maxHeight: '100%',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
    backgroundColor: 'rgba(255,255,255,0.75)',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
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
    backgroundColor: '#E20880',
  },
  buttonOpen: {
    backgroundColor: '#228bc6',
  },
  buttonClose: {
    backgroundColor: '#228bc6',
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    // marginTop: 22,
    backgroundColor: 'rgba(255,255,255,0.75)',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
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
    backgroundColor: '#E20880',
  },
  buttonOpen: {
    backgroundColor: '#228bc6',
  },
  buttonClose: {
    backgroundColor: '#228bc6',
  },
  textStyle: {
    color: 'black',
    textAlign: 'center',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
  },

  container: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
  },
  keyboardAvoid: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
  },
  modal: {
    position: 'absolute',
    // display: "flex",
    alignSelf: 'center',
    width: '75%',
    maxWidth: 300,
    overflow: 'hidden',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: GLOBALS.COLORS.LIGHT_GRAY,
  },
  titleArea: {},
  title: {
    fontSize: 16,
    backgroundColor: GLOBALS.COLORS.WHITE,
    color: GLOBALS.COLORS.BLACK,
    paddingTop: 20,
    paddingBottom: 5,
    paddingHorizontal: 15,
    justifyContent: 'center',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  subtitle: {
    paddingTop: 5,
    paddingBottom: 10,
    paddingHorizontal: 15,
    backgroundColor: GLOBALS.COLORS.WHITE,
    color: GLOBALS.COLORS.BLACK,
    textAlign: 'center',
    fontSize: 14,
  },
  optionsArea: {
    padding: 10,
    backgroundColor: GLOBALS.COLORS.WHITE,
  },
  activity: {
    padding: 15,
  },
  input: {
    paddingTop: 10,
    paddingLeft: 10,
    paddingRight: 10,
    paddingBottom: 10,
    borderWidth: 1,
    borderColor: GLOBALS.COLORS.LIGHT_GRAY,
    minHeight: 80,
    borderTopRightRadius: 10,
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
  },
  lettercount: {
    flex: 1,
    alignSelf: 'flex-end',
    paddingTop: 2,
    color: GLOBALS.COLORS.MID_GRAY,
    fontSize: 12,
  },
  hintText: {
    color: GLOBALS.COLORS.GRADIENT_PRIMARY,
    textAlign: 'center',
    fontSize: 14,
  },
  doneArea: {},
  done: {
    borderTopWidth: 1,
    borderColor: GLOBALS.COLORS.LIGHT_BLACK_TRANS,
    padding: 15,
    backgroundColor: GLOBALS.COLORS.WHITE,
  },
  doneText: {
    color: GLOBALS.COLORS.GRADIENT_PRIMARY,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 10,
  },
  cancelArea: {},
  cancel: {
    borderTopWidth: 1,
    borderColor: GLOBALS.COLORS.LIGHT_BLACK_TRANS,
    padding: 15,
    backgroundColor: GLOBALS.COLORS.WHITE,
  },
  cancelText: {
    color: GLOBALS.COLORS.LINKS,
    textAlign: 'center',
    fontSize: 16,
  },
});

export default SubscriptionStatus;
