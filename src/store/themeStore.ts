import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type ThemePref = "light" | "dark" | "system";

interface ThemeState {
  theme: ThemePref;
  setTheme: (t: ThemePref) => void;
}

export const THEME_STORAGE_KEY = "zt-ui:theme";

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: "system",
      setTheme: (t) => set({ theme: t }),
    }),
    {
      name: THEME_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ theme: s.theme }),
    },
  ),
);

export function resolveDark(theme: ThemePref, systemDark: boolean): boolean {
  if (theme === "dark") return true;
  if (theme === "light") return false;
  return systemDark;
}
