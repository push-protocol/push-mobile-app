import {useNavigation} from '@react-navigation/native';
import React, {useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {useDispatch} from 'react-redux';
import GLOBALS from 'src/Globals';
import PrimaryButton from 'src/components/buttons/PrimaryButton';
import LimitInput from 'src/components/input/LimitInput';
import ErrorModalWrapper from 'src/components/misc/ErrorModalWrapper';
import OnboardingWrapper from 'src/components/misc/OnboardingWrapper';
import {QR_TYPES} from 'src/enums';
import Web3Helper from 'src/helpers/Web3Helper';
import useModalBlur from 'src/hooks/ui/useModalBlur';
import useQrScanner from 'src/hooks/ui/useQrScanner';
import {setAuthType, setInitialSignin, setIsGuest} from 'src/redux/authSlice';

const SignInScreenAdvance = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [privateKey, setPrivateKey] = useState('');
  const [error, setError] = useState({title: '', subtitle: ''});
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const {showScanner, ScannerComponent} = useQrScanner({
    title: 'Scan your private key to continue.',
    doneFunc: async (code: string) => {
      setPrivateKey(code);
      await handleLogin(code);
    },
    qrType: QR_TYPES.ETH_PK_SCAN,
  });

  const {
    ModalComponent: ErrorModal,
    hideModal: hideErrorModal,
    showModal: showErrorModal,
  } = useModalBlur();

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
      showErrorModal();
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
        backgroundColor={GLOBALS.COLORS.BG_BIOMETRIC}
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
            onPress={() => showScanner()}
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
      <ScannerComponent />
      <ErrorModal
        InnerComponent={ErrorModalWrapper}
        InnerComponentProps={{
          title: error.title,
          subtitle: error.subtitle,
          footerButtons: [
            {
              title: 'Ok',
              bgColor: GLOBALS.COLORS.BLACK,
              fontColor: GLOBALS.COLORS.WHITE,
              onPress: () => hideErrorModal(),
            },
          ],
        }}
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
