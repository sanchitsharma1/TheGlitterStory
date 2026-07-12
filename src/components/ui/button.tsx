import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "gold";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary:
    "bg-ink text-ivory hover:bg-ink/90 shadow-sm",
  secondary:
    "bg-transparent text-ink border border-ink/20 hover:border-ink/50 hover:bg-ivory-dark/40",
  ghost: "bg-transparent text-ink hover:bg-ink/5",
  danger: "bg-red-700 text-white hover:bg-red-800",
  gold: "bg-gold text-ink hover:bg-gold-dark shadow-sm",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3.5 text-sm tracking-wide",
  md: "h-11 px-5 text-[15px] tracking-wide",
  lg: "h-12 px-7 text-[13px] tracking-[0.12em] uppercase sm:text-sm",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-45",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
