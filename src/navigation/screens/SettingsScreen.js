import {useWalletConnect} from '@walletconnect/react-native-dapp';
import React, {useRef} from 'react';
import {FlatList, Image, StatusBar, StyleSheet, Text, View} from 'react-native';
import SafeAreaView from 'react-native-safe-area-view';
import {useDispatch, useSelector} from 'react-redux';
import GLOBALS from 'src/Globals';
import ImageTitleButton from 'src/components/buttons/ImageTitleButton';
import ImageTitleSwitchButton from 'src/components/buttons/ImageTitleSwitchButton';
import Dropdown from 'src/components/custom/Dropdown';
import {Toaster} from 'src/components/indicators/Toaster';
import OverlayBlur from 'src/components/modals/OverlayBlur';
import ENV_CONFIG from 'src/env.config';
import AuthenticationHelper from 'src/helpers/AuthenticationHelper';
import {selectUsers, setLogout} from 'src/redux/authSlice';
import MetaStorage from 'src/singletons/MetaStorage';

const SettingsScreen = ({}) => {
  const dispatch = useDispatch();
  const users = useSelector(selectUsers);

  // Wallet Connect functionality
  const connector = useWalletConnect();

  // Setup Refs
  const OverlayBlurRef = useRef(null);
  const ToasterRef = useRef(null);

  // FUNCTIONS
  // // ADD HEADER COMPONENET
  // const addHeaderComponent = (navigation) => {
  //   navigation.setOptions({
  //     headerLeft: () => {
  //       return null
  //     },
  //   })
  // }

  // Render Items in Settings
  const renderItem = ({item}) => {
    if (item.type === 'button') {
      return (
        <ImageTitleButton
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

  // To Unarchive Message
  // const unarchiveMessages = async () => {
  //   const db = FeedDBHelper.getDB()
  //   await FeedDBHelper.unhideAllFeedItems(db)

  //   // Change the header back
  //   addHeaderComponent(navigation)

  //   showToast(
  //     'Messages Unarchived! Restarting...',
  //     '',
  //     ToasterOptions.TYPE.GRADIENT_PRIMARY,
  //   )

  //   setTimeout(() => {
  //     dispatch(setAuthState(GLOBALS.AUTH_STATES.ONBOARDING))
  //   }, 1500)
  // }

  // To Reset Wallet
  const resetWallet = async () => {
    await AuthenticationHelper.resetSignedInUser();
    await MetaStorage.instance.clearStorage();
    dispatch(setLogout(null));
  };

  // CONSTANTS
  let settingsOptions = [];

  // Unarchive Messages
  // settingsOptions.push({
  //   title: 'Unarchive Messages',
  //   img: require('assets/ui/unarchive.png'),
  //   func: () => {
  //     unarchiveMessages();
  //   },
  //   type: 'button',
  // })

  // Sign in with another wallet
  // Disable multiple wallet singin
  // settingsOptions.push({
  //   title: 'Sign in with another wallet',
  //   img: require('assets/ui/brokenkey.png'),
  //   func: () => {
  //     if (users.length < 5) {
  //       dispatch(clearFeed(null));
  //       dispatch(createNewWallet({wallet: '', userPKey: ''}));
  //       dispatch(setAuthState(GLOBALS.AUTH_STATE.ONBOARDING));
  //     }
  //   },
  //   type: 'button',
  // });

  // Swipe Reset
  users.length === 1 &&
    settingsOptions.push({
      title: 'Swipe / Reset Wallet',
      img: require('assets/ui/unlink.png'),
      func: () => {
        resetWallet();
      },
      type: 'button',
    });

  // Wallet Connect Disconnect
  if (connector.connected) {
    // Add Wallet Connect Disconnect Link
    settingsOptions.push({
      title: 'Disconnect WalletConnect',
      img: require('assets/ui/wcsettings.png'),
      func: () => {
        connector.killSession();
      },
      type: 'button',
    });
  }

  // RENDER
  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.container}>
        <StatusBar
          barStyle={'dark-content'}
          translucent
          backgroundColor="transparent"
        />

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

          <View style={styles.appInfo}>
            <Text
              style={
                styles.appText
              }>{`Ethereum Push Notification Service(Alpha) v${ENV_CONFIG.APP_VERSION}`}</Text>
            <Image
              style={styles.appImage}
              source={require('assets/ui/fulllogo.png')}
            />
          </View>
        </View>
      </SafeAreaView>

      {/* Overlay Blur to show incase need to emphasize on something */}
      <OverlayBlur
        ref={OverlayBlurRef}
        onPress={() => {
          exitIntentOnOverleyBlur();
        }}
      />

      {/* Toaster Always goes here in the end after safe area */}
      <Toaster ref={ToasterRef} />
    </View>
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
    bottom: 20,
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