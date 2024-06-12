import {PayloadAction, createSelector, createSlice} from '@reduxjs/toolkit';

import {Channel} from './channelSlice';

type ModalSliceData = {
  INTERNET_ERROR: {
    isOpen: boolean;
  };
  WALLET_CONNECT_ERROR: {
    isOpen: boolean;
  };
  NFSETTING_SHEET: {
    isOpen: boolean;
    channel?: Channel;
  };
};

const initialState: ModalSliceData = {
  INTERNET_ERROR: {
    isOpen: false,
  },
  WALLET_CONNECT_ERROR: {
    isOpen: false,
  },
  NFSETTING_SHEET: {
    isOpen: false,
  },
};

const modalSlice = createSlice({
  name: 'modal',
  initialState,
  reducers: {
    openModal: <T extends keyof ModalSliceData>(
      state: ModalSliceData,
      action: PayloadAction<{modalKey: T; data: ModalSliceData[T]}>,
    ): void => {
      state[action.payload.modalKey] = action.payload.data;
    },

    closeModal: <T extends keyof ModalSliceData>(
      state: ModalSliceData,
      action: PayloadAction<{modalKey: T}>,
    ) => {
      state[action.payload.modalKey] = {isOpen: false};
    },
  },
});

export const {openModal, closeModal} = modalSlice.actions;

type ReturnTypeModal = {modal: ModalSliceData};

export const selectModal = <T extends keyof ModalSliceData>(modalKey: T) =>
  createSelector(
    (state: {modal: ModalSliceData}) => state.modal[modalKey],
    modal => modal,
  );

export const selectModals = (state: ReturnTypeModal) => state.modal;

export default modalSlice.reducer;
