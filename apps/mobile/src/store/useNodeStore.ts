import { useSyncExternalStore } from "react";
import { storage } from "@/lib/storage";

const STORAGE_KEY_ACTIVE_NODE = "agrolight_active_node_id";

export interface NodeState {
  activeNodeId: string | null;
  isInitialized: boolean;
}

let state: NodeState = {
  activeNodeId: null,
  isInitialized: false,
};

const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

// Inisialisasi awal membaca node ID dari persistent storage saat app start
async function initStore() {
  try {
    const savedId = await storage.getItem(STORAGE_KEY_ACTIVE_NODE);
    if (savedId) {
      state = { ...state, activeNodeId: savedId, isInitialized: true };
      notify();
      return;
    }
  } catch (err) {
    console.warn("[useNodeStore] Gagal membaca active node dari storage:", err);
  }
  state = { ...state, isInitialized: true };
  notify();
}

initStore();

export const nodeStore = {
  getState(): NodeState {
    return state;
  },

  async setActiveNodeId(id: string | null): Promise<void> {
    const sanitized = id?.trim() || null;
    state = { ...state, activeNodeId: sanitized };
    notify();

    try {
      if (sanitized) {
        await storage.setItem(STORAGE_KEY_ACTIVE_NODE, sanitized);
      } else {
        await storage.removeItem(STORAGE_KEY_ACTIVE_NODE);
      }
    } catch (err) {
      console.warn("[useNodeStore] Gagal menyimpan active node ke storage:", err);
    }
  },

  async resetActiveNodeId(): Promise<void> {
    return this.setActiveNodeId(null);
  },
};

/**
 * Hook global state untuk mengakses dan memperbarui active node yang sedang dipantau.
 */
export function useNodeStore(): NodeState & {
  setActiveNodeId: (id: string | null) => Promise<void>;
  resetActiveNodeId: () => Promise<void>;
} {
  const current = useSyncExternalStore(
    (callback) => {
      listeners.add(callback);
      return () => listeners.delete(callback);
    },
    () => state,
  );

  return {
    ...current,
    setActiveNodeId: nodeStore.setActiveNodeId,
    resetActiveNodeId: nodeStore.resetActiveNodeId,
  };
}
