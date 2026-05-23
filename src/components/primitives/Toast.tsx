import * as RToast from "@radix-ui/react-toast";
import { AlertCircle, CheckCircle2, Info, TriangleAlert, X } from "lucide-react";
import { useUiStore, type ToastKind } from "@/store/uiStore";
import { cn } from "@/lib/cn";

const ICONS: Record<ToastKind, JSX.Element> = {
  info: <Info className="h-4 w-4 text-accent" />,
  success: <CheckCircle2 className="h-4 w-4 text-success" />,
  warn: <TriangleAlert className="h-4 w-4 text-warn" />,
  error: <AlertCircle className="h-4 w-4 text-danger" />,
};

export function ToastViewport() {
  const toasts = useUiStore((s) => s.toasts);
  const dismiss = useUiStore((s) => s.dismissToast);

  return (
    <RToast.Provider swipeDirection="right" duration={5000}>
      {toasts.map((t) => (
        <RToast.Root
          key={t.id}
          onOpenChange={(o) => {
            if (!o) dismiss(t.id);
          }}
          className={cn(
            "rounded-lg border border-border bg-panel shadow-pop px-3 py-2.5",
            "data-[state=open]:animate-slideUp",
            "flex items-start gap-2 w-[320px]",
          )}
        >
          <div className="mt-0.5">{ICONS[t.kind]}</div>
          <div className="min-w-0 flex-1">
            <RToast.Title className="text-sm font-medium leading-tight">
              {t.title}
            </RToast.Title>
            {t.description ? (
              <RToast.Description className="mt-0.5 text-xs text-subtle break-words">
                {t.description}
              </RToast.Description>
            ) : null}
          </div>
          <RToast.Close
            aria-label="Dismiss"
            className="text-subtle hover:text-fg rounded p-0.5"
          >
            <X className="h-3.5 w-3.5" />
          </RToast.Close>
        </RToast.Root>
      ))}
      <RToast.Viewport className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 outline-none" />
    </RToast.Provider>
  );
}
