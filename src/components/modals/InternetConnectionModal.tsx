import {useNetInfo} from '@react-native-community/netinfo';
import React, {useCallback, useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import GLOBALS from 'src/Globals';
import useModalBlur from 'src/hooks/ui/useModalBlur';
import {closeModal, openModal, selectModal} from 'src/redux/modalSlice';

import {ErrorModal} from './ErrorModal';

export const InternetConnectionModal = () => {
  const {isOpen} = useSelector(selectModal('INTERNET_ERROR'));
  const {ModalComponent} = useModalBlur(isOpen);
  const {isConnected} = useNetInfo();
  const dispatch = useDispatch();

  const checkConnection = useCallback(
    async (connected: boolean | null) => {
      if (connected) {
        dispatch(closeModal({modalKey: 'INTERNET_ERROR'}));
      } else if (connected === false) {
        if (!isOpen)
          dispatch(
            openModal({modalKey: 'INTERNET_ERROR', data: {isOpen: true}}),
          );
      }
    },
    [dispatch],
  );

  useEffect(() => {
    const timeoutId = setTimeout(() => checkConnection(isConnected), 1000);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [isConnected]);

  return (
    <ModalComponent
      InnerComponent={ErrorModal}
      InnerComponentProps={{
        title: 'Connection Error',
        subtitle: 'Unable to establish a connection. Please try again.',
        footerButtons: [
          {
            fontColor: GLOBALS.COLORS.WHITE,
            bgColor: GLOBALS.COLORS.BLACK,
            title: 'Retry',
            onPress: async () => {
              await checkConnection(isConnected);
            },
          },
        ],
      }}
    />
  );
};
