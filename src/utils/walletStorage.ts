export function getWalletAddress(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('walletAddress') || null;
  }
  return null;
}

export function setWalletAddress(address: string | null) {
  if (typeof window !== 'undefined') {
    if (address) {
      localStorage.setItem('walletAddress', address);
    } else {
      localStorage.removeItem('walletAddress');
    }
  }
}
