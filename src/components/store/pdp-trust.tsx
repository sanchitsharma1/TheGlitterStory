import { Gift, Lock, Package, RotateCcw } from "lucide-react";

export function PdpTrust({
  freeShippingThreshold,
  returnDays,
}: {
  freeShippingThreshold: number;
  returnDays: number;
}) {
  const items = [
    {
      icon: Package,
      label: `Free ship ₹${freeShippingThreshold}+`,
    },
    {
      icon: Lock,
      label: "Secure Razorpay pay",
    },
    {
      icon: Gift,
      label: "Gift-ready packing",
    },
    {
      icon: RotateCcw,
      label: `${returnDays}-day returns`,
    },
  ];

  return (
    <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
      {items.map(({ icon: Icon, label }) => (
        <div
          key={label}
          className="flex items-center gap-2.5 rounded-xl border border-ink/10 bg-white/70 px-3 py-2.5"
        >
          <Icon size={16} className="shrink-0 text-gold-dark" />
          <span className="text-xs leading-snug text-ink/70 sm:text-[13px]">
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}
