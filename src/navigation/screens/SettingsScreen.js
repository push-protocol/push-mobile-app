import {useNavigation} from '@react-navigation/native';
import {useWalletConnectModal} from '@walletconnect/modal-react-native';
import React, {useRef, useState} from 'react';
import {FlatList, Image, StatusBar, StyleSheet, Text, View} from 'react-native';
import SafeAreaView from 'react-native-safe-area-view';
import {useDispatch, useSelector} from 'react-redux';
import GLOBALS from 'src/Globals';
import ImageTitleButton from 'src/components/buttons/ImageTitleButton';
import ImageTitleSwitchButton from 'src/components/buttons/ImageTitleSwitchButton';
import Dropdown from 'src/components/custom/Dropdown';
import {Toaster} from 'src/components/indicators/Toaster';
import ConfirmResetWallet from 'src/components/modals/ConfirmResetWallet';
import OverlayBlur from 'src/components/modals/OverlayBlur';
import Header from 'src/components/ui/Header';
import {usePushApi} from 'src/contexts/PushApiContext';
import ENV_CONFIG from 'src/env.config';
import AuthenticationHelper from 'src/helpers/AuthenticationHelper';
import {clearStorage} from 'src/navigation/screens/chats/helpers/storage';
import {selectUsers, setLogout} from 'src/redux/authSlice';
import MetaStorage from 'src/singletons/MetaStorage';

const SettingsScreen = ({route}) => {
  const dispatch = useDispatch();
  const users = useSelector(selectUsers);

  const tabBarHeight = route?.params?.tabBarHeight || 80;

  // Wallet Connect functionality
  const wc_connector = useWalletConnectModal();

  // Setup Refs
  const OverlayBlurRef = useRef(null);
  const ToasterRef = useRef(null);

  // To Reset Wallet

  const [isModalOpen, setIsModalOpen] = useState(false);

  // Render Items in Settings
  const renderItem = ({item}) => {
    if (item.type === 'button') {
      return (
        <ImageTitleButton
          loading={false}
          title={item.title}
          img={item.img}
          onPress={item.func}
        />
      );
    } else if (item.type === 'switch') {
      return (
        <ImageTitleSwitchButton
          title={item.title}
          img={item.img}
          onPress={item.func}
          isOn={item.isOn}
          onSwitchOnFunc={item.onSwitchOnFunc}
          onSwitchOffFunc={item.onSwitchOffFunc}
        />
      );
    } else {
      return null;
    }
  };

  // To Reset Wallet
  const resetWallet = async () => {
    setIsModalOpen(true);
  };

  const clearUserData = async () => {
    // do wallet connect disconnect
    if (wc_connector.isConnected) {
      wc_connector.provider.disconnect();
    }

    await Promise.all([
      AuthenticationHelper.resetSignedInUser(),
      MetaStorage.instance.clearStorage(),
      clearStorage(),
    ]);
    dispatch(setLogout(null));
    setIsModalOpen(false);
  };
  const onCancel = () => {
    setIsModalOpen(false);
  };

  // CONSTANTS
  let settingsOptions = [];

  // Swipe Reset
  users.length === 1 &&
    settingsOptions.push({
      title: 'Logout',
      img: require('assets/ui/unlink.png'),
      func: () => {
        resetWallet();
      },
      type: 'button',
    });

  if (isModalOpen) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.container}>
          <StatusBar
            barStyle={'dark-content'}
            translucent
            backgroundColor="transparent"
          />
          <View style={styles.modalContainer}>
            <ConfirmResetWallet
              title="Swipe / Reset Wallet"
              subtitle="Resetting your wallet means all your data will be cleared from this device and you will be logged out. Are you sure you want to proceed?"
              closeTitle="Yes"
              closeFunc={clearUserData}
              cancelTitle="No"
              cancelFunc={onCancel}
            />
          </View>
        </SafeAreaView>
      </View>
    );
  }

  // RENDER
  return (
    <>
      <Header title="Settings" />

      <View style={styles.settingsContainer}>
        <View style={{marginBottom: 20}}>
          <FlatList
            style={styles.settings}
            bounces={true}
            data={settingsOptions}
            keyExtractor={item => item.title}
            renderItem={renderItem}
          />

          {users.length > 1 && (
            <View style={styles.dropdown}>
              <Dropdown label="Logout" data={users} />
            </View>
          )}
        </View>

        <View style={[styles.appInfo, {bottom: tabBarHeight}]}>
          <Text
            style={styles.appText}>{`PUSH v${ENV_CONFIG.APP_VERSION}`}</Text>
          <Image
            style={styles.appImage}
            source={require('assets/ui/fulllogo.png')}
          />
        </View>
      </View>

      {/* Overlay Blur to show incase need to emphasize on something */}
      <OverlayBlur
        ref={OverlayBlurRef}
        onPress={() => {
          exitIntentOnOverleyBlur();
        }}
      />

      {/* Toaster Always goes here in the end after safe area */}
      <Toaster ref={ToasterRef} />
    </>
  );
};

// Styling
const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    backgroundColor: GLOBALS.COLORS.WHITE,
  },
  settingsContainer: {
    flex: 1,
    position: 'relative',
    backgroundColor: GLOBALS.COLORS.WHITE,
  },
  settings: {},
  appInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 5,
    paddingHorizontal: 15,
    marginLeft: 80,
    position: 'absolute',
    right: 0,
  },
  appImage: {
    height: 40,
    width: 60,
    resizeMode: 'contain',
    padding: 10,
  },
  appText: {
    flex: 1,
    padding: 10,
    textAlign: 'right',
    fontSize: 12,
    color: GLOBALS.COLORS.MID_GRAY,
  },
  dropdown: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    marginTop: 5,
  },
});

export default SettingsScreen;
