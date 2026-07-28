import { cn } from "@/lib/utils";

export function Badge({
  children,
  className,
  tone = "default",
}: {
  children: React.ReactNode;
  className?: string;
  tone?: "default" | "gold" | "sold" | "success" | "muted";
}) {
  const tones = {
    default: "bg-ink/5 text-ink",
    // Solid gold pill - high contrast on product photos
    gold: "bg-gold text-ink border border-ink/10 shadow-sm",
    sold: "bg-ink text-ivory shadow-sm",
    success: "bg-emerald-50 text-emerald-800 border border-emerald-200",
    muted: "bg-stone-100 text-stone-600",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.12em]",
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
