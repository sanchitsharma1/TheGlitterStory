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
    gold: "bg-gold/20 text-ink border border-gold/40",
    sold: "bg-ink/80 text-ivory",
    success: "bg-emerald-50 text-emerald-800 border border-emerald-200",
    muted: "bg-stone-100 text-stone-600",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.12em]",
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
