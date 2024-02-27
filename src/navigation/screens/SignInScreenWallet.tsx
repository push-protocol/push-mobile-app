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

const SignInScreenWallet = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [input, setInput] = useState('');
  const [error, setError] = useState({title: '', subtitle: ''});

  const {ScannerComponent, showScanner} = useQrScanner({
    qrType: QR_TYPES.ETH_ADDRESS_SCAN,
    doneFunc: async (code: string) => {
      const addr = code.includes(':') ? code.split(':')[1] : code;
      setInput(addr);
      await handleSignin(addr);
    },
    title: 'Scan your wallet address to continue.',
  });

  const navigation = useNavigation();
  const dispatch = useDispatch();

  const {
    ModalComponent: ErrorModal,
    hideModal: hideErrorModal,
    showModal: showErrorModal,
  } = useModalBlur();

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
      setError({
        title: 'Invalid Wallet Address or Domain',
        subtitle: 'Please enter a valid erc20 wallet address or web3 domain',
      });
      showErrorModal();
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
            onPress={() => showScanner()}
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
