import { cn } from "@/lib/utils";
import { InputHTMLAttributes, forwardRef } from "react";

export const Input = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      "flex h-11 w-full rounded-xl border border-ink/15 bg-white/80 px-3.5 text-[15px] text-ink placeholder:text-ink/40 outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/25 disabled:opacity-50",
      className
    )}
    {...props}
  />
));
Input.displayName = "Input";
