import { cn } from "@/lib/utils";
import { TextareaHTMLAttributes, forwardRef } from "react";

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "flex min-h-[110px] w-full rounded-xl border border-ink/15 bg-white/80 px-3.5 py-3 text-[15px] text-ink placeholder:text-ink/40 outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/25 disabled:opacity-50",
      className
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";
