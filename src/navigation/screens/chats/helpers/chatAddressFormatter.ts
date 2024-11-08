import {useEffect, useState} from 'react';
import Web3Helper from 'src/helpers/Web3Helper';

const MAX_ADDRESS_LEN = 21;

export const getTrimmedAddress = (
  originalAddress: string,
  trimLength?: number,
) => {
  const addrsLen = originalAddress.length;
  if (addrsLen >= MAX_ADDRESS_LEN) {
    const startPart = originalAddress.substring(0, trimLength ?? 8);
    const endPart = originalAddress.substring(addrsLen - (trimLength ?? 7));
    return `${startPart}...${endPart}`;
  }
  return originalAddress;
};

const getFormattedAddress = (originalAddress: string) => {
  const [formattedAddress, setFormattedAddress] = useState(
    getTrimmedAddress(originalAddress),
  );

  useEffect(() => {
    (async () => {
      // resolve ens
      const res = await Web3Helper.getENSReverseDomain(originalAddress);
      if (res.success) {
        // @ts-ignore: Unreachable code error
        setFormattedAddress(res.ens);
        return;
      }

      const [success, name] = await Web3Helper.getUDRev(originalAddress);
      if (success) {
        // @ts-ignore: Unreachable code error
        setFormattedAddress(name);
        return;
      }
    })();
  }, []);

  return formattedAddress;
};

export {getFormattedAddress};
