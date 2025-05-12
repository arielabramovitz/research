// timedStorage.ts
// Utility for storing expiring data in localStorage

export const timedStorage = {
  set: (key: string, value: any, ttlMs: number) => {
    const now = Date.now();
    const item = {
      value,
      expiry: now + ttlMs,
    };
    localStorage.setItem(key, JSON.stringify(item));
  },

  get: (key: string) => {
    const itemStr = localStorage.getItem(key);
    if (!itemStr) return null;
    try {
      const item = JSON.parse(itemStr);
      if (!item.expiry || Date.now() > item.expiry) {
        localStorage.removeItem(key);
        return null;
      }
      return item.value;
    } catch {
      localStorage.removeItem(key);
      return null;
    }
  },

  remove: (key: string) => {
    localStorage.removeItem(key);
  }
}; 