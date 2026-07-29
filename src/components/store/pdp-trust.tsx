import { Gift, Lock, RotateCcw, Truck } from "lucide-react";

/**
 * Soft trust strip for PDP — light neumorphic tiles on ivory.
 * Even 2×2 grid, consistent padding, no nested tray.
 */
export function PdpTrust({
  freeShippingThreshold,
  shippingFee,
  returnDays,
}: {
  freeShippingThreshold: number;
  shippingFee: number;
  returnDays: number;
}) {
  const items = [
    {
      icon: Truck,
      title: "Free shipping",
      detail: `Orders ₹${freeShippingThreshold}+ · else ₹${shippingFee}`,
    },
    {
      icon: Lock,
      title: "Secure payment",
      detail: "Razorpay · UPI, cards, netbanking",
    },
    {
      icon: Gift,
      title: "Gift-ready",
      detail: "Thoughtful packing for every order",
    },
    {
      icon: RotateCcw,
      title: "Easy returns",
      detail: `${returnDays}-day window · see policy`,
    },
  ];

  return (
    <div
      className="mt-6 grid grid-cols-2 gap-3 sm:mt-7 sm:gap-3.5"
      role="list"
      aria-label="Shopping benefits"
    >
      {items.map(({ icon: Icon, title, detail }) => (
        <div
          key={title}
          role="listitem"
          className="flex items-start gap-3 rounded-2xl px-3.5 py-3.5 sm:px-4 sm:py-4"
          style={{
            background: "linear-gradient(145deg, #faf7f0 0%, #f0ebe0 100%)",
            boxShadow:
              "5px 5px 12px rgba(26, 26, 26, 0.055), -4px -4px 10px rgba(255, 255, 255, 0.85)",
          }}
        >
          <span
            className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
            style={{
              background: "linear-gradient(145deg, #f5f0e6 0%, #e8e0d0 100%)",
              boxShadow:
                "inset 1.5px 1.5px 3px rgba(255,255,255,0.95), inset -1.5px -1.5px 3px rgba(26,26,26,0.05)",
            }}
            aria-hidden
          >
            <Icon size={16} className="text-gold-dark" strokeWidth={1.75} />
          </span>
          <div className="min-w-0 flex-1 pt-0.5">
            <p className="text-[13px] font-semibold leading-snug text-ink sm:text-sm">
              {title}
            </p>
            <p className="mt-1 text-[11px] leading-relaxed text-ink/55 sm:text-xs">
              {detail}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
