import {QR_TYPES} from 'src/enums';
import Web3 from 'web3';

const QRCodeVerification = (data: string, qrType: string): boolean => {
  console.log(data);
  if (qrType === QR_TYPES.ETH_ADDRESS_SCAN) {
    return Web3.utils.isAddress(data);
  } else if (qrType === QR_TYPES.ETH_PK_SCAN) {
  } else if (qrType === QR_TYPES.DAPP_PGP_SCAN) {
  }
  return true;
};

export {QRCodeVerification};
