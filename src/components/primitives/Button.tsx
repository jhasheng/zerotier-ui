import { forwardRef, type ButtonHTMLAttributes } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "outline";
type Size = "sm" | "md" | "lg" | "icon";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

const variants: Record<Variant, string> = {
  primary:
    "bg-accent text-accent-fg hover:bg-accent/90 active:bg-accent/80 shadow-soft",
  secondary:
    "bg-muted text-fg hover:bg-muted/70 active:bg-muted/60 border border-border",
  ghost: "bg-transparent text-fg hover:bg-muted",
  danger:
    "bg-danger text-white hover:bg-danger/90 active:bg-danger/80 shadow-soft",
  outline:
    "bg-transparent text-fg border border-border hover:bg-muted active:bg-muted/70",
};

const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-sm rounded-md gap-1.5",
  md: "h-9 px-4 text-sm rounded-md gap-2",
  lg: "h-11 px-5 text-base rounded-lg gap-2",
  icon: "h-9 w-9 rounded-md",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = "primary",
    size = "md",
    loading,
    disabled,
    className,
    children,
    type = "button",
    ...rest
  },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center font-medium transition-colors select-none",
        "disabled:bg-muted disabled:text-subtle disabled:border-border disabled:shadow-none disabled:cursor-not-allowed",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
        variants[variant],
        sizes[size],
        className,
      )}
      {...rest}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
      {children}
    </button>
  );
});
