import React, {useRef, useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useDispatch, useSelector} from 'react-redux';
import GLOBALS from 'src/Globals';
import PrimaryButton from 'src/components/buttons/PrimaryButton';
import {Toaster} from 'src/components/indicators/Toaster';
import ProfileFromDappBuilder from 'src/components/web3/ProfileFromDappBuilder';
import {selectAuthState} from 'src/redux/authSlice';
import {setInitialSignin} from 'src/redux/authSlice';
import MetaStorage from 'src/singletons/MetaStorage';

const SignInScreen = props => {
  const dispatch = useDispatch();
  const toastRef = useRef();
  const authState = useSelector(selectAuthState);

  const {code, navigation} = props.route.params;
  const {peerId, aesSecret, account} = JSON.parse(code);

  const [isComplete, setProfileComplete] = useState(false);
  const pgpSecret = useRef('');

  const setPgpPk = pgpPk => {
    pgpSecret.current = pgpPk;
  };

  // Load the Next Screen
  const loadNextScreen = async () => {
    console.log('go next');
    try {
      // Store that user login fromdapp
      await MetaStorage.instance.setUserLoginFromDapp();

      // store chat data
      await MetaStorage.instance.setUserChatData({
        pgpPrivateKey: pgpSecret.current,
        encryptionPublicKey: '',
      });

      // navigate to bimetrics screen
      dispatch(
        setInitialSignin({
          wallet: account,
          userPKey: '',
          ensRefreshTime: new Date().getTime() / 1000, // Time in epoch
          cns: '',
          ens: '',
          index: 0,
        }),
      );

      // Goto Next
      if (authState === GLOBALS.AUTH_STATE.AUTHENTICATED) {
        navigation.navigate(GLOBALS.SCREENS.CHATS, {focues: 'true'});
      } else {
        navigation.navigate(GLOBALS.SCREENS.BIOMETRIC);
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <SafeAreaView style={styles.container}>
        <Text style={styles.header}>Loading From Dapp</Text>
        <View style={styles.inner}>
          <ProfileFromDappBuilder
            aes={aesSecret}
            peerId={peerId}
            wallet={account}
            setProfileComplete={setProfileComplete}
            setPgpPk={setPgpPk}
            navigation={navigation}
            toastRef={toastRef}
            style={styles.profile}
          />
        </View>
        {isComplete && (
          <PrimaryButton
            iconFactory="Ionicons"
            icon="ios-arrow-forward"
            iconSize={24}
            title="Continue"
            fontSize={16}
            fontColor={GLOBALS.COLORS.WHITE}
            bgColor={GLOBALS.COLORS.GRADIENT_THIRD}
            onPress={() => {
              loadNextScreen();
            }}
            style={styles.buttonStyle}
            disabled={!isComplete}
          />
        )}
        <Toaster ref={toastRef} />
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
    fontSize: 32,
    fontWeight: 'bold',
    paddingTop: 40,
    alignSelf: 'center',
    paddingHorizontal: 20,
  },
  inner: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    top: 0,
    bottom: 0,
    padding: 20,
    maxWidth: 540,
  },
  para: {
    marginBottom: 20,
  },
  profile: {},
  insetAdjustment: {
    paddingBottom: 5,
  },
  noInsetAdjustment: {
    paddingBottom: 20,
  },
  buttonStyle: {
    bottom: '-35%',
    marginHorizontal: 20,
  },
});

export default SignInScreen;
