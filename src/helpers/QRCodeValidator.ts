import {QR_TYPES} from 'src/enums';
import Web3 from 'web3';

const QRCodeVerification = (data: string, qrType: string): boolean => {
  try {
    if (qrType === QR_TYPES.ETH_ADDRESS_SCAN) {
      // handle both address and ethereum:address
      const addrss = data.split(':');
      const addrs = addrss[addrss.length - 1];

      return Web3.utils.isAddress(addrs);
    } else if (qrType === QR_TYPES.ETH_PK_SCAN) {
      // PASS
    } else if (qrType === QR_TYPES.DAPP_PGP_SCAN) {
      // check the qr scanned from the dapp is valid
      const json = JSON.parse(data);
      if (json.aesSecret !== '' && json.peerId !== '' && json.account !== '') {
        return true;
      }
    }
  } catch (e) {
    console.log('error parsing the scanned code', e);
    return false;
  }
  return true;
};

export {QRCodeVerification};
