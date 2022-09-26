const getCAIPAddress = (address: string) => {
  return `eip155:42:${address}`;
};

export const walletToCAIP10 = (account: string): string => {
  return `eip155:${account}`;
};

export const caip10ToWallet = (wallet: string): string => {
  wallet = wallet.replace('eip155:', '');
  return wallet;
};

export {getCAIPAddress};
