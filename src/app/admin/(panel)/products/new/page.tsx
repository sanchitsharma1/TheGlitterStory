import { redirect } from "next/navigation";
import { getStaffProfile, canAccess } from "@/lib/auth/staff";
import { createServiceClient } from "@/lib/supabase/server";
import { ProductForm } from "../product-form";
import type { Category } from "@/types";

export default async function NewProductPage() {
  const staff = await getStaffProfile().catch(() => null);
  if (!staff) redirect("/admin/login");
  if (!canAccess(staff, "products")) redirect("/admin");

  const supabase = createServiceClient();
  const { data } = await supabase.from("categories").select("*").order("sort_order");

  return (
    <div>
      <h1 className="mb-6 font-display text-3xl">New product</h1>
      <ProductForm categories={(data as Category[]) ?? []} />
    </div>
  );
}
