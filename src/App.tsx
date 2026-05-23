import { Outlet } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { useThemeEffect } from "@/hooks/useThemeEffect";

export default function App() {
  useThemeEffect();
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}
