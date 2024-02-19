import {useNavigation} from '@react-navigation/native';
import {useWalletConnectModal} from '@walletconnect/modal-react-native';
import React, {useEffect} from 'react';
import {Image, StyleSheet, View} from 'react-native';
import {useDispatch} from 'react-redux';
import GLOBALS from 'src/Globals';
import OnboardingWrapper from 'src/components/misc/OnboardingWrapper';
import Web3Helper from 'src/helpers/Web3Helper';
import {setAuthType, setInitialSignin} from 'src/redux/authSlice';

const SingInScreen = () => {
  const navigation = useNavigation();
  const {provider, isConnected, open, address} = useWalletConnectModal();
  const dispatch = useDispatch();

  const walletConnectHandler = async () => {
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
      if (isConnected) {
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
        // @ts-ignore
        navigation.navigate(GLOBALS.SCREENS.SETUPCOMPLETE);
      }
    })();
  }, [isConnected]);

  return (
    <OnboardingWrapper
      title="Connect your wallet to enable important features in Push."
      footerLabel="By signing in, you agree to Push's [Terms & Conditions](https://push.org/tos/) and [Privacy Policy](https://push.org/privacy/)."
      footerButtons={[
        {
          iconFactory: 'Image',
          icon: require('assets/ui/walletConnect.png'),
          iconSize: 24,
          iconFirst: true,
          title: 'Sign in with Wallet',
          fontColor: GLOBALS.COLORS.WHITE,
          bgColor: GLOBALS.COLORS.BLACK,
          onPress: walletConnectHandler,
        },
        {
          iconFactory: 'Image',
          icon: require('assets/ui/pencil_logo.png'),
          iconSize: 24,
          iconFirst: true,
          title: 'Enter wallet address',
          fontColor: GLOBALS.COLORS.BLACK,
          bgColor: GLOBALS.COLORS.WHITE,
          borderColor: GLOBALS.COLORS.MID_GRAY,
          onPress: loadWalletScreen,
        },
        {
          iconFactory: 'Image',
          icon: require('assets/ui/walletadv.png'),
          iconSize: 24,
          iconFirst: true,
          title: 'Advanced',
          fontColor: GLOBALS.COLORS.BLACK,
          bgColor: GLOBALS.COLORS.WHITE,
          borderColor: GLOBALS.COLORS.MID_GRAY,
          onPress: loadAdvanceScreen,
        },
      ]}>
      <View style={styles.container}>
        <Image source={require('assets/ui/wallet.png')} style={styles.image} />
      </View>
    </OnboardingWrapper>
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
});
