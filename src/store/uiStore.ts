import { create } from "zustand";

export type ToastKind = "info" | "success" | "warn" | "error";

export interface ToastItem {
  id: string;
  kind: ToastKind;
  title: string;
  description?: string;
}

interface UiState {
  sidebarCollapsed: boolean;
  toasts: ToastItem[];
  toggleSidebar: () => void;
  setSidebar: (v: boolean) => void;
  pushToast: (t: Omit<ToastItem, "id">) => string;
  dismissToast: (id: string) => void;
}

let toastCounter = 0;
function nextToastId(): string {
  toastCounter += 1;
  return `t${Date.now()}-${toastCounter}`;
}

export const useUiStore = create<UiState>()((set) => ({
  sidebarCollapsed: false,
  toasts: [],
  toggleSidebar: () =>
    set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setSidebar: (v) => set({ sidebarCollapsed: v }),
  pushToast: (t) => {
    const id = nextToastId();
    set((s) => ({ toasts: [...s.toasts, { id, ...t }] }));
    return id;
  },
  dismissToast: (id) =>
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

export function toast(kind: ToastKind, title: string, description?: string) {
  useUiStore.getState().pushToast({ kind, title, description });
}
