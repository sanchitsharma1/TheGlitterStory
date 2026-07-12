import { NextResponse } from "next/server";
import { getStaffProfile, canAccess } from "@/lib/auth/staff";
import { createServiceClient } from "@/lib/supabase/server";
import { sendOrderStatusEmail } from "@/lib/email/send";
import type { Order } from "@/types";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const staff = await getStaffProfile().catch(() => null);
  if (!staff || !canAccess(staff, "orders")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const supabase = createServiceClient();

  const { data: before } = await supabase
    .from("orders")
    .select("status")
    .eq("id", id)
    .maybeSingle();

  const { data: order, error } = await supabase
    .from("orders")
    .update({
      status: body.status,
      payment_status: body.payment_status,
      admin_note: body.admin_note,
    })
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  // Email customer when fulfilment status changes
  if (order && before?.status && body.status && body.status !== before.status) {
    await sendOrderStatusEmail(order as Order, String(body.status));
  }

  return NextResponse.json({ ok: true });
}
