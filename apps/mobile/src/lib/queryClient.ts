import { QueryClient } from "@tanstack/react-query";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";

const memoryStore = new Map<string, string>();
let hasWarnedMemoryFallback = false;

function warnFallbackOnce(reason: unknown) {
  if (__DEV__ && !hasWarnedMemoryFallback) {
    hasWarnedMemoryFallback = true;
    console.warn(
      "[SafeAsyncStorage] Modul native AsyncStorage tidak tersedia, beralih ke in-memory fallback cache:",
      reason,
    );
  }
}

const safeAsyncStorage = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      if (AsyncStorage && typeof AsyncStorage.getItem === "function") {
        return await AsyncStorage.getItem(key);
      }
    } catch (e: unknown) {
      warnFallbackOnce(e);
    }
    return memoryStore.get(key) ?? null;
  },
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      if (AsyncStorage && typeof AsyncStorage.setItem === "function") {
        await AsyncStorage.setItem(key, value);
        return;
      }
    } catch (e: unknown) {
      warnFallbackOnce(e);
    }
    memoryStore.set(key, value);
  },
  removeItem: async (key: string): Promise<void> => {
    try {
      if (AsyncStorage && typeof AsyncStorage.removeItem === "function") {
        await AsyncStorage.removeItem(key);
        return;
      }
    } catch (e: unknown) {
      warnFallbackOnce(e);
    }
    memoryStore.delete(key);
  },
};

export const asyncStoragePersister = createAsyncStoragePersister({
  storage: safeAsyncStorage,
  key: "AGROLIGHT_OFFLINE_CACHE",
});

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache tersimpan di memori dan storage selama 24 jam untuk ketahanan offline di kebun
      gcTime: 1000 * 60 * 60 * 24,
      // Dashboard dan monitoring segar selama 30 detik
      staleTime: 1000 * 30,
      retry: (failureCount, error) => {
        if (failureCount >= 2) return false;
        const errObj = error as { status?: number; response?: { status?: number } };
        const status = errObj.status ?? errObj.response?.status;
        // Jangan mengulang request jika ditolak izin atau rate limit
        if (status && [401, 402, 403, 404, 422, 429].includes(status)) {
          return false;
        }
        return true;
      },
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: false,
    },
  },
});

// Dev-only logger untuk memantau frekuensi query dan mendeteksi duplikasi request
if (__DEV__) {
  queryClient.getQueryCache().subscribe((event) => {
    if (event.type === "updated" && "action" in event && event.action.type === "fetch") {
      const keyStr = JSON.stringify(event.query.queryKey);
      console.log(`[QueryCache: FETCH] ${keyStr}`);
    }
  });
}
