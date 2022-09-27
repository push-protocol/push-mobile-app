const MAX_ADDRESS_LEN = 21;
const getFormattedAddress = (originalAddress: string) => {
  const addrsLen = originalAddress.length;
  if (addrsLen >= MAX_ADDRESS_LEN) {
    return `${originalAddress.substring(0, 8)}...${originalAddress.substring(
      addrsLen - 7,
    )}`;
  }
  return originalAddress;
};

export {getFormattedAddress};
