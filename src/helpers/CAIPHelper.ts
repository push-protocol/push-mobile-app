const getCAIPAddress = (address: string) => {
  return `eip155:42:${address}`;
};

export const walletToCAIP10 = ({
  account,
  chainId,
}: {
  account: string;
  chainId: number;
}): string => {
  if (account.includes('eip155:1') || account.includes('eip155:42')) {
    return account;
  }
  if (chainId === 1) {
    return 'eip155:1:' + account;
  } else if (chainId === 42) {
    return 'eip155:42:' + account;
  } else {
    throw new Error();
  }
};

export const caip10ToWallet = (wallet: string): string => {
  wallet = wallet.replace('eip155:1:', '');
  wallet = wallet.replace('eip155:42:', '');
  return wallet;
};

export {getCAIPAddress};
