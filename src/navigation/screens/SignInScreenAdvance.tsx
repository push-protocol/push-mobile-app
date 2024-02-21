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

const SignInScreenAdvance = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [privateKey, setPrivateKey] = useState('');
  const [error, setError] = useState({title: '', subtitle: ''});
  const qrScannerRef = useRef<QRScanner>(null);
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const {getCameraPermissionAsync} = usePermissions();

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

  const handleLogin = async (key?: string) => {
    setLoading(true);
    const pkey = key || privateKey;
    const provider = Web3Helper.getWeb3Provider();
    const {success, wallet} = await Web3Helper.getWalletAddress(pkey, provider);
    if (!success) {
      setError({
        title: 'Invalid Private Key',
        subtitle: 'Please enter a valid private key',
      });
      showErrorNotice();
    } else {
      const {cns, ens} = await Web3Helper.reverseResolveWalletBoth(wallet);
      dispatch(setAuthType(GLOBALS.AUTH_TYPE.PRIVATE_KEY));
      dispatch(setIsGuest(false));
      dispatch(
        setInitialSignin({
          wallet: wallet,
          ensRefreshTime: new Date().getTime() / 1000, // Time in epoch
          cns: cns || '',
          ens: ens || '',
          index: 0,
          userPKey: pkey,
        }),
      );
      // @ts-ignore
      navigation.navigate(GLOBALS.SCREENS.BIOMETRIC, {
        wallet,
        privateKey: pkey,
        fromOnboarding: true,
      });
    }
    setLoading(false);
  };

  return (
    <>
      <OnboardingWrapper
        title="Import your existing account using private key."
        subtitle="Please proceed with importing your private key only if you are fully aware of the risks and are confident in this approach."
        footerLabel="Your private key can be used by malicious apps to compromise you. [Learn about risks](https://www.coinbase.com/learn/crypto-basics/what-is-a-private-key) and [Verify our repo](https://github.com/ethereum-push-notification-service/push-mobile-app)"
        footerButtons={[
          {
            loading: loading,
            onPress: () => handleLogin(),
            title: 'Import',
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
            title="Scan QR Code for Private Key"
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
            limit={64}
            defaultValue={privateKey}
            value={privateKey}
            onChangeText={txt => setPrivateKey(txt)}
            title="Enter private key"
            textAlignVertical="center"
            returnKeyType="done"
            onSubmitEditing={() => handleLogin()}
          />
        </View>
      </OnboardingWrapper>
      <QRScanner
        ref={qrScannerRef}
        navigation={navigation}
        navHeader="Link Wallet Address"
        errorMessage="Ensure that it is a valid Eth private key QR"
        title="Scan your Eth private key to link your device to the push app"
        qrType={QR_TYPES.ETH_PK_SCAN}
        doneFunc={async (code: string) => {
          setPrivateKey(code);
          await handleLogin(code);
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

export default SignInScreenAdvance;

const styles = StyleSheet.create({
  divider: {
    width: '100%',
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
  },
  container: {
    marginHorizontal: 24,
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    justifyContent: 'center',
  },
});
