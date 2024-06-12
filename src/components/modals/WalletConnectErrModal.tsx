import {useConfigure} from '@walletconnect/modal-react-native/src/hooks/useConfigure';
import React, {useCallback, useEffect, useMemo} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import GLOBALS from 'src/Globals';
import useModalBlur from 'src/hooks/ui/useModalBlur';
import {selectAuthState, selectAuthType} from 'src/redux/authSlice';
import {closeModal, openModal, selectModal} from 'src/redux/modalSlice';
import {WalletConnectConfig} from 'src/walletconnect';

import appConfig from '../../../app.json';
import {ErrorModal} from './ErrorModal';

export const WalletConnectErrModal = () => {
  const authState = useSelector(selectAuthState);
  const authType = useSelector(selectAuthType);
  const {isOpen} = useSelector(selectModal('WALLET_CONNECT_ERROR'));
  const {isOpen: isInternetError} = useSelector(selectModal('INTERNET_ERROR'));
  const {ModalComponent} = useModalBlur(isOpen && !isInternetError);
  const dispatch = useDispatch();

  const {initProvider} = useConfigure({
    projectId: WalletConnectConfig.projectId,
    providerMetadata: WalletConnectConfig.providerMetadata(
      `${appConfig.expo.scheme}://`,
    ),
    relayUrl: 'wss://relay.walletconnect.com',
  });

  const tryWalletConnection = useCallback(async () => {
    initProvider()
      .then(() => {
        if (isOpen) dispatch(closeModal({modalKey: 'WALLET_CONNECT_ERROR'}));
      })
      .catch(() => {
        /*
         * If not already open and not using private key, open the modal
         * If user is using private key, we do not need wallet connect capabilities
         */
        if (!isOpen && authType !== GLOBALS.AUTH_TYPE.PRIVATE_KEY) {
          dispatch(
            openModal({modalKey: 'WALLET_CONNECT_ERROR', data: {isOpen: true}}),
          );
        }
      });
  }, [initProvider]);

  useEffect(() => {
    tryWalletConnection();
  }, []);

  const footerButtons = useMemo(() => {
    const buttons = [
      {
        fontColor: GLOBALS.COLORS.WHITE,
        bgColor: GLOBALS.COLORS.BLACK,
        title: 'Retry',
        onPress: async () => {
          await tryWalletConnection();
        },
      },
    ];
    if (authState !== GLOBALS.AUTH_STATE.AUTHENTICATED) {
      /**
       * If user is not authenticated, show cancel button
       * So that user can try other login methods
       */
      buttons.push({
        fontColor: GLOBALS.COLORS.BLACK,
        bgColor: GLOBALS.COLORS.TRANSPARENT,
        title: 'Cancel',
        onPress: async () => {
          dispatch(closeModal({modalKey: 'WALLET_CONNECT_ERROR'}));
        },
      });
    }
    return buttons;
  }, [authState]);

  return (
    <ModalComponent
      InnerComponent={ErrorModal}
      InnerComponentProps={{
        title: 'Connection Error',
        subtitle:
          'Unable to establish a connection with WalletConnect. Please try again.',
        footerButtons,
      }}
    />
  );
};
