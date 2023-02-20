const getCAIPAddress = (ethAddress: string) => {
  return `eip155:${ethAddress}`;
};

export const walletToCAIP10 = (account: string): string => {
  return `eip155:${account}`;
};

export const caip10ToWallet = (wallet: string): string => {
  wallet = wallet.replace('eip155:', '');
  return wallet;
};

export const getCombinedDID = (addrs1: string, addrs2: string) => {
  return `eip155:${addrs1}_eip155:${addrs2}`;
};

export {getCAIPAddress};
