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

export {getCAIPAddress};
