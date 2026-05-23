import * as RDialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface DialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}

const sizes = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
};

export function Dialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  size = "md",
}: DialogProps) {
  return (
    <RDialog.Root open={open} onOpenChange={onOpenChange}>
      <RDialog.Portal>
        <RDialog.Overlay className="fixed inset-0 z-40 bg-black/40 animate-fadeIn" />
        <RDialog.Content
          className={cn(
            "fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2",
            "w-[calc(100vw-2rem)] rounded-xl border border-border bg-panel shadow-pop animate-slideUp",
            "flex flex-col max-h-[90vh]",
            sizes[size],
          )}
        >
          <div className="flex items-start justify-between gap-4 px-5 pt-5 pb-3 border-b border-border">
            <div className="min-w-0">
              <RDialog.Title className="text-base font-semibold leading-tight">
                {title}
              </RDialog.Title>
              {description ? (
                <RDialog.Description className="mt-1 text-sm text-subtle">
                  {description}
                </RDialog.Description>
              ) : null}
            </div>
            <RDialog.Close
              aria-label="Close"
              className="text-subtle hover:text-fg rounded-md p-1 -m-1"
            >
              <X className="h-4 w-4" />
            </RDialog.Close>
          </div>
          <div className="px-5 py-4 overflow-auto">{children}</div>
          {footer ? (
            <div className="px-5 py-3 border-t border-border flex items-center justify-end gap-2 bg-muted/40 rounded-b-xl">
              {footer}
            </div>
          ) : null}
        </RDialog.Content>
      </RDialog.Portal>
    </RDialog.Root>
  );
}

export interface DrawerProps extends Omit<DialogProps, "size"> {
  width?: "sm" | "md" | "lg";
}

const drawerWidths = {
  sm: "max-w-md",
  md: "max-w-xl",
  lg: "max-w-2xl",
};

export function Drawer({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  width = "md",
}: DrawerProps) {
  return (
    <RDialog.Root open={open} onOpenChange={onOpenChange}>
      <RDialog.Portal>
        <RDialog.Overlay className="fixed inset-0 z-40 bg-black/40 animate-fadeIn" />
        <RDialog.Content
          className={cn(
            "fixed right-0 top-0 bottom-0 z-50 w-full",
            "border-l border-border bg-panel shadow-pop animate-slideInRight",
            "flex flex-col",
            drawerWidths[width],
          )}
        >
          <div className="flex items-start justify-between gap-4 px-5 py-4 border-b border-border">
            <div className="min-w-0">
              <RDialog.Title className="text-base font-semibold leading-tight">
                {title}
              </RDialog.Title>
              {description ? (
                <RDialog.Description className="mt-1 text-sm text-subtle">
                  {description}
                </RDialog.Description>
              ) : null}
            </div>
            <RDialog.Close
              aria-label="Close"
              className="text-subtle hover:text-fg rounded-md p-1 -m-1"
            >
              <X className="h-4 w-4" />
            </RDialog.Close>
          </div>
          <div className="flex-1 overflow-auto px-5 py-4">{children}</div>
          {footer ? (
            <div className="px-5 py-3 border-t border-border flex items-center justify-end gap-2 bg-muted/40">
              {footer}
            </div>
          ) : null}
        </RDialog.Content>
      </RDialog.Portal>
    </RDialog.Root>
  );
}
