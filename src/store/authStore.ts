import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface AuthState {
  host: string;
  token: string;
  lastConnectedAt: number | null;
  setCreds: (host: string, token: string) => void;
  markConnected: () => void;
  clear: () => void;
  isConfigured: () => boolean;
}

const DEFAULT_HOST =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_DEFAULT_HOST) ||
  "";

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      host: DEFAULT_HOST,
      token: "",
      lastConnectedAt: null,
      setCreds: (host, token) =>
        set({ host: host.trim().replace(/\/+$/, ""), token: token.trim() }),
      markConnected: () => set({ lastConnectedAt: Date.now() }),
      clear: () => set({ token: "", lastConnectedAt: null }),
      isConfigured: () => {
        const { host, token } = get();
        return Boolean(host && token);
      },
    }),
    {
      name: "zt-ui:auth",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        host: s.host,
        token: s.token,
        lastConnectedAt: s.lastConnectedAt,
      }),
    },
  ),
);
