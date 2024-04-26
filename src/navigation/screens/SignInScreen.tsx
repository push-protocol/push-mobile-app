import {user as pushUser} from '@pushprotocol/restapi';
import {ENV} from '@pushprotocol/restapi/src/lib/constants';
import {useNavigation} from '@react-navigation/native';
import {useWalletConnectModal} from '@walletconnect/modal-react-native';
import React, {useEffect} from 'react';
import {Image, StyleSheet, Text, View} from 'react-native';
import {useDispatch} from 'react-redux';
import GLOBALS from 'src/Globals';
import {createEmptyUser} from 'src/apis';
import LoadingSpinner from 'src/components/loaders/LoadingSpinner';
import OnboardingWrapper from 'src/components/misc/OnboardingWrapper';
import envConfig from 'src/env.config';
import {walletToCAIP10} from 'src/helpers/CAIPHelper';
import Web3Helper from 'src/helpers/Web3Helper';
import useModalBlur from 'src/hooks/ui/useModalBlur';
import {setAuthType, setInitialSignin} from 'src/redux/authSlice';
import {openModal} from 'src/redux/modalSlice';

const SingInScreen = () => {
  const navigation = useNavigation();
  const {provider, isConnected, open, address} = useWalletConnectModal();
  const dispatch = useDispatch();

  const {
    ModalComponent: SigningInModal,
    showModal: showSigningInModal,
    hideModal: hideSigningInModal,
  } = useModalBlur();

  const walletConnectHandler = async (showError = false) => {
    if (!provider && showError) {
      dispatch(
        openModal({modalKey: 'WALLET_CONNECT_ERROR', data: {isOpen: true}}),
      );
    }
    if (isConnected) provider?.disconnect();
    else await open();
  };

  const loadAdvanceScreen = () => {
    // @ts-ignore
    navigation.navigate(GLOBALS.SCREENS.SIGNINADVANCE);
  };

  const loadWalletScreen = () => {
    // @ts-ignore
    navigation.navigate(GLOBALS.SCREENS.SIGNINWALLET);
  };

  useEffect(() => {
    // Open wallet connect modal automatically
    setTimeout(() => walletConnectHandler(), 500);
  }, []);

  useEffect(() => {
    (async () => {
      if (isConnected && address && provider) {
        showSigningInModal();
        let user;
        user = await pushUser.get({
          account: address,
          env: envConfig.ENV as ENV,
        });
        if (user === null) {
          user = await createEmptyUser(walletToCAIP10(address));
        }
        const {cns, ens} = await Web3Helper.reverseResolveWalletBoth(address);
        dispatch(setAuthType(GLOBALS.AUTH_TYPE.WALLET_CONNECT));
        dispatch(
          setInitialSignin({
            wallet: address,
            userPKey: '',
            ensRefreshTime: new Date().getTime() / 1000, // Time in epoch
            cns: cns || '',
            ens: ens || '',
            index: 0,
          }),
        );
        hideSigningInModal();
        // @ts-ignore
        navigation.navigate(GLOBALS.SCREENS.SETUPCOMPLETE, {user});
      }
    })();
  }, [isConnected]);

  return (
    <>
      <OnboardingWrapper
        backgroundColor={GLOBALS.COLORS.BG_SIGNIN}
        title="Connect your wallet to enable important features in Push."
        footerLabel="By signing in, you agree to Push's [Terms & Conditions](https://push.org/tos/) and [Privacy Policy](https://push.org/privacy/)."
        footerButtons={[
          {
            title: 'Sign In with Wallet',
            fontColor: GLOBALS.COLORS.WHITE,
            bgColor: GLOBALS.COLORS.BLACK,
            onPress: () => walletConnectHandler(true),
          },
          {
            title: 'Enter Wallet Address',
            fontColor: GLOBALS.COLORS.BLACK,
            bgColor: GLOBALS.COLORS.TRANSPARENT,
            borderColor: GLOBALS.COLORS.BLACK,
            onPress: loadWalletScreen,
          },
          {
            title: 'Advanced',
            fontColor: GLOBALS.COLORS.BLACK,
            bgColor: GLOBALS.COLORS.TRANSPARENT,
            borderColor: GLOBALS.COLORS.BLACK,
            onPress: loadAdvanceScreen,
          },
        ]}>
        <View style={styles.container}>
          <Image
            source={require('assets/ui/onboarding/ob-connect.png')}
            style={styles.image}
          />
        </View>
      </OnboardingWrapper>
      <SigningInModal
        InnerComponent={() => (
          <View style={styles.signingInModalContainer}>
            <Text style={styles.signingInModalText}>Signing you in...</Text>
            <LoadingSpinner />
          </View>
        )}
      />
    </>
  );
};

export default SingInScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: 184,
    height: 184,
    aspectRatio: 1,
    resizeMode: 'contain',
  },
  signingInModalContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
  },
  signingInModalText: {
    color: GLOBALS.COLORS.BLACK,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22,
    letterSpacing: -0.43,
    marginBottom: 16,
  },
});
