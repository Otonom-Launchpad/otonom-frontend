export function safeLocalStorageGet(key: string): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(key);
  }
  return null;
}

export function safeLocalStorageSet(key: string, value: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(key, value);
  }
}

export function safeLocalStorageRemove(key: string) {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(key);
  }
}
