import { redirect, notFound } from "next/navigation";
import { getStaffProfile, canAccess } from "@/lib/auth/staff";
import { createServiceClient } from "@/lib/supabase/server";
import { ProductForm } from "../product-form";
import type { Category, Product } from "@/types";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const staff = await getStaffProfile().catch(() => null);
  if (!staff) redirect("/admin/login");
  if (!canAccess(staff, "products")) redirect("/admin");

  const supabase = createServiceClient();
  const [{ data: product }, { data: categories }] = await Promise.all([
    supabase.from("products").select("*").eq("id", id).maybeSingle(),
    supabase.from("categories").select("*").order("sort_order"),
  ]);

  if (!product) notFound();

  const normalized: Product = {
    ...(product as Product),
    price: Number(product.price),
    compare_at_price: product.compare_at_price ? Number(product.compare_at_price) : null,
    stock: Number(product.stock),
    images: product.images ?? [],
  };

  return (
    <div>
      <h1 className="mb-6 font-display text-3xl">Edit product</h1>
      <ProductForm
        categories={(categories as Category[]) ?? []}
        product={normalized}
      />
    </div>
  );
}
