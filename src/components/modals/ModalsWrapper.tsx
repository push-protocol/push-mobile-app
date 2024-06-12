import React, {memo} from 'react';

import {InternetConnectionModal} from './InternetConnectionModal';
import {WalletConnectErrModal} from './WalletConnectErrModal';

const ModalsWrapperComponent = () => {
  return (
    <>
      <InternetConnectionModal />
      <WalletConnectErrModal />
    </>
  );
};

export const ModalsWrapper = memo(ModalsWrapperComponent);
