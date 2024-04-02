import {useNetInfo} from '@react-native-community/netinfo';
import React, {useEffect} from 'react';
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

  useEffect(() => {
    if (isConnected) {
      if (isOpen) dispatch(closeModal({modalKey: 'INTERNET_ERROR'}));
    } else {
      if (!isOpen)
        dispatch(openModal({modalKey: 'INTERNET_ERROR', data: {isOpen: true}}));
    }
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
              await new Promise(resolve => setTimeout(resolve, 500));
            },
          },
        ],
      }}
    />
  );
};
