import { redirect } from "next/navigation";
import { getStaffProfile, canAccess } from "@/lib/auth/staff";
import { createServiceClient } from "@/lib/supabase/server";
import { MarkReadButton } from "./mark-read";

export default async function AdminNotificationsPage() {
  const staff = await getStaffProfile().catch(() => null);
  if (!staff) redirect("/admin/login");
  if (!canAccess(staff, "dashboard")) redirect("/admin");

  const supabase = createServiceClient();
  const { data: notes } = await supabase
    .from("admin_notifications")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl">Alerts</h1>
          <p className="text-sm text-ink/55">Sold-out, low stock, and new order notifications</p>
        </div>
        <MarkReadButton />
      </div>

      <div className="mt-8 space-y-3">
        {(notes ?? []).length === 0 ? (
          <p className="rounded-2xl border border-dashed border-ink/15 px-4 py-10 text-center text-sm text-ink/45">
            No alerts yet.
          </p>
        ) : (
          (notes ?? []).map((n) => (
            <div
              key={n.id}
              className={`rounded-2xl border px-4 py-4 ${
                n.is_read
                  ? "border-ink/8 bg-white/60"
                  : "border-gold/40 bg-gold/10"
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-medium text-ink">{n.title}</p>
                <p className="text-xs text-ink/45">
                  {new Date(n.created_at).toLocaleString("en-IN")}
                </p>
              </div>
              <p className="mt-1 text-sm text-ink/70">{n.message}</p>
              <p className="mt-1 text-[10px] uppercase tracking-wider text-ink/40">
                {n.type.replaceAll("_", " ")}
                {!n.is_read && " · unread"}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
