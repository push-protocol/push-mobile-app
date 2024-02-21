import {useNavigation} from '@react-navigation/native';
import React, {useRef, useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {useDispatch} from 'react-redux';
import GLOBALS from 'src/Globals';
import PrimaryButton from 'src/components/buttons/PrimaryButton';
import LimitInput from 'src/components/input/LimitInput';
import OnboardingWrapper from 'src/components/misc/OnboardingWrapper';
import QRScanner from 'src/components/modals/QRScanner';
import {QR_TYPES} from 'src/enums';
import Web3Helper from 'src/helpers/Web3Helper';
import usePermissions from 'src/hooks/system/usePermissions';
import useNotice from 'src/hooks/ui/useNotice';
import {setAuthType, setInitialSignin, setIsGuest} from 'src/redux/authSlice';

const SignInScreenWallet = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [input, setInput] = useState('');
  const [error, setError] = useState({title: '', subtitle: ''});

  const qrScannerRef = useRef<QRScanner>(null);
  const navigation = useNavigation();
  const {getCameraPermissionAsync} = usePermissions();
  const dispatch = useDispatch();

  const {
    NoticeComponent: PermissionsNotice,
    hideNotice: hidePermissionsNotice,
    showNotice: showPermissionsNotice,
  } = useNotice();

  const {
    NoticeComponent: ErrorNotice,
    hideNotice: hideErrorNotice,
    showNotice: showErrorNotice,
  } = useNotice();

  const toggleQRScanner = (toggle: boolean) => {
    qrScannerRef.current?.changeRenderState(toggle, navigation);
  };

  const handleSignin = async (code?: string) => {
    setLoading(true);
    const address = code || input;
    try {
      const {wallet} = await Web3Helper.resolveBlockchainDomainAndWallet(
        address,
      );
      const {cns, ens} = await Web3Helper.reverseResolveWalletBoth(wallet);
      dispatch(setAuthType(GLOBALS.AUTH_TYPE.WALLET));
      dispatch(setIsGuest(true));
      dispatch(
        setInitialSignin({
          wallet,
          userPKey: '',
          ensRefreshTime: new Date().getTime() / 1000, // Time in epoch
          cns: cns || '',
          ens: ens || '',
          index: 0,
        }),
      );
      // @ts-ignore
      navigation.navigate(GLOBALS.SCREENS.BIOMETRIC);
    } catch (e) {
      console.log('Errror', e);
      setError({
        title: 'Invalid Wallet Address or Domain',
        subtitle: 'Please enter a valid erc20 wallet address or web3 domain',
      });
      showErrorNotice();
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <OnboardingWrapper
        title="Enter your wallet address to sign in."
        footerButtons={[
          {
            loading: loading,
            title: 'Sign In',
            onPress: () => handleSignin(),
            bgColor: GLOBALS.COLORS.PINK,
            fontColor: GLOBALS.COLORS.WHITE,
          },
        ]}>
        <View style={styles.container}>
          <PrimaryButton
            iconFirst={true}
            iconFactory="MaterialIcons"
            icon="qr-code-scanner"
            iconSize={24}
            title="Scan Wallet Address"
            fontColor={GLOBALS.COLORS.BLACK}
            bgColor={GLOBALS.COLORS.TRANSPARENT}
            borderColor={GLOBALS.COLORS.BLACK}
            onPress={() =>
              getCameraPermissionAsync({
                onPermissionDenied: showPermissionsNotice,
                onPermissionGranted: () => toggleQRScanner(true),
              })
            }
          />
          <Text style={styles.divider}>or</Text>
          <LimitInput
            defaultValue={input}
            value={input}
            onChangeText={txt => setInput(txt)}
            title="Enter Wallet Address or Web3 Domain"
            textAlignVertical="center"
            returnKeyType="done"
            onSubmitEditing={() => handleSignin()}
          />
        </View>
      </OnboardingWrapper>
      <QRScanner
        ref={qrScannerRef}
        navigation={navigation}
        navHeader="Link Wallet Address"
        errorMessage="Ensure that it is a valid Eth address QR"
        title="Scan your Eth wallet address to link your device to the push app"
        qrType={QR_TYPES.ETH_ADDRESS_SCAN}
        doneFunc={async (code: string) => {
          const addr = code.includes(':') ? code.split(':')[1] : code;
          setInput(addr);
          await handleSignin(addr);
        }}
        closeFunc={() => toggleQRScanner(false)}
      />
      <PermissionsNotice
        closeFunc={hidePermissionsNotice}
        closeTitle="OK"
        title="Camera Access"
        subtitle="Need Camera Permissions for scanning QR Code"
        notice="Please enable Camera Permissions from [appsettings:App Settings] to continue"
      />
      <ErrorNotice
        closeFunc={hideErrorNotice}
        closeTitle="OK"
        title={error.title}
        subtitle={error.subtitle}
      />
    </>
  );
};

export default SignInScreenWallet;

const styles = StyleSheet.create({
  divider: {
    width: '100%',
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
    marginVertical: 8,
  },
  container: {
    marginHorizontal: 24,
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    justifyContent: 'center',
  },
});
