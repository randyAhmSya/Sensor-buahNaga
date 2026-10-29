import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

// In-memory fallback map jika native storage tidak ter-link atau melempar error
const memoryFallbackMap = new Map<string, string>();

let isSecureStoreAvailable: boolean | null = null;

async function checkSecureStoreAvailable(): Promise<boolean> {
  if (isSecureStoreAvailable !== null) {
    return isSecureStoreAvailable;
  }
  if (Platform.OS === "web") {
    isSecureStoreAvailable = false;
    return false;
  }
  try {
    isSecureStoreAvailable = await SecureStore.isAvailableAsync();
  } catch {
    isSecureStoreAvailable = false;
  }
  return isSecureStoreAvailable;
}

/**
 * Storage helper aman untuk token dan credential sesi.
 * Menggunakan expo-secure-store di Android/iOS jika modul tersedia,
 * dengan automatic memory fallback map jika native module null / unlinked.
 */
export const storage = {
  async setItem(key: string, value: string): Promise<void> {
    // Selalu simpan ke memory fallback map agar sinkron di runtime
    memoryFallbackMap.set(key, value);

    try {
      if (Platform.OS === "web") {
        if (typeof window !== "undefined" && window.localStorage) {
          window.localStorage.setItem(key, value);
        }
        return;
      }

      const available = await checkSecureStoreAvailable();
      if (available) {
        await SecureStore.setItemAsync(key, value);
      }
    } catch {
      // Diamkan error native module; memory fallback sudah menyimpan nilai
    }
  },

  async getItem(key: string): Promise<string | null> {
    try {
      if (Platform.OS === "web") {
        if (typeof window !== "undefined" && window.localStorage) {
          const val = window.localStorage.getItem(key);
          if (val !== null) return val;
        }
        return memoryFallbackMap.get(key) ?? null;
      }

      const available = await checkSecureStoreAvailable();
      if (available) {
        const stored = await SecureStore.getItemAsync(key);
        if (stored !== null) {
          memoryFallbackMap.set(key, stored);
          return stored;
        }
      }
    } catch {
      // Fallback ke memory map jika native module melempar error
    }

    return memoryFallbackMap.get(key) ?? null;
  },

  async removeItem(key: string): Promise<void> {
    memoryFallbackMap.delete(key);

    try {
      if (Platform.OS === "web") {
        if (typeof window !== "undefined" && window.localStorage) {
          window.localStorage.removeItem(key);
        }
        return;
      }

      const available = await checkSecureStoreAvailable();
      if (available) {
        await SecureStore.deleteItemAsync(key);
      }
    } catch {
      // Diamkan error
    }
  },
};

export default storage;
