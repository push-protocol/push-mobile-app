import React, {useRef, useState} from 'react';
import {ActivityIndicator, StyleSheet, View} from 'react-native';
import GLOBALS from 'src/Globals';
import PrimaryButton from 'src/components/buttons/PrimaryButton';
import NoticePrompt from 'src/components/modals/NoticePrompt';
import OverlayBlur from 'src/components/modals/OverlayBlur';
import {useSubscriptions} from 'src/contexts/SubscriptionsContext';

const SubscriptionStatus = ({channel, user, style, pKey}) => {
  const [processing, setProcessing] = useState(false);

  const {
    subscriptions,
    toggleSubscription,
    isLoading: isLoadingSubscriptions,
  } = useSubscriptions();

  const subscribed = subscriptions?.[channel] !== undefined;

  // Setup Refs
  const OverlayBlurRef = useRef(null);
  const NoticePromptRef = useRef(null);

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

  const handleChangeSubStatus = async () => {
    setProcessing(true);
    await toggleSubscription(channel);
    setProcessing(false);
  };

  return (
    <View style={styles.container}>
      {isLoadingSubscriptions && (
        <ActivityIndicator
          size={'small'}
          color={GLOBALS.COLORS.GRADIENT_PRIMARY}
        />
      )}

      {subscribed === true && (
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
          onPress={handleChangeSubStatus}
        />
      )}

      {subscribed === false && (
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
          onPress={handleChangeSubStatus}
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

      {/* <Modal
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
