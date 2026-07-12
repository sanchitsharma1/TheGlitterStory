"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const STATUSES = [
  "pending_payment",
  "placed",
  "confirmed",
  "packed",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
] as const;

const PAYMENT = ["pending", "paid", "failed", "refunded"] as const;

export function OrderStatusForm({
  orderId,
  status,
  paymentStatus,
  adminNote,
}: {
  orderId: string;
  status: string;
  paymentStatus: string;
  adminNote: string;
}) {
  const router = useRouter();
  const [form, setForm] = useState({
    status,
    payment_status: paymentStatus,
    admin_note: adminNote,
  });
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function save() {
    setLoading(true);
    setMsg(null);
    const res = await fetch(`/api/admin/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setLoading(false);
    if (!res.ok) {
      setMsg("Update failed");
      return;
    }
    setMsg("Saved");
    router.refresh();
  }

  return (
    <div className="mt-4 space-y-3">
      <div>
        <label className="mb-1 block text-xs uppercase tracking-wider text-ink/45">
          Order status
        </label>
        <select
          className="h-11 w-full rounded-xl border border-ink/15 bg-white px-3 text-sm"
          value={form.status}
          onChange={(e) => setForm({ ...form, status: e.target.value })}
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s.replaceAll("_", " ")}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1 block text-xs uppercase tracking-wider text-ink/45">
          Payment status
        </label>
        <select
          className="h-11 w-full rounded-xl border border-ink/15 bg-white px-3 text-sm"
          value={form.payment_status}
          onChange={(e) => setForm({ ...form, payment_status: e.target.value })}
        >
          {PAYMENT.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1 block text-xs uppercase tracking-wider text-ink/45">
          Admin note
        </label>
        <Textarea
          value={form.admin_note}
          onChange={(e) => setForm({ ...form, admin_note: e.target.value })}
        />
      </div>
      {msg && <p className="text-xs text-ink/55">{msg}</p>}
      <Button type="button" onClick={save} disabled={loading}>
        {loading ? "Saving…" : "Update order"}
      </Button>
    </div>
  );
}
