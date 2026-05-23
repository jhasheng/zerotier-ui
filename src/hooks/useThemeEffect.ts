import { useEffect } from "react";
import { useThemeStore, resolveDark } from "@/store/themeStore";

// Applies the user's theme preference to <html>. Runs once on mount, then
// reacts to either the store change or the system color-scheme media query.
export function useThemeEffect(): void {
  const theme = useThemeStore((s) => s.theme);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => {
      const dark = resolveDark(theme, mq.matches);
      document.documentElement.classList.toggle("dark", dark);
    };
    apply();
    // Only system mode actually needs the listener, but subscribing
    // unconditionally is cheaper than re-attaching across theme changes.
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [theme]);
}
