import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function formatINR(amount: number, symbol = "₹"): string {
  const safe = Number.isFinite(amount) ? amount : 0;
  return `${symbol}${safe.toLocaleString("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

export function generateOrderNumber(): string {
  const now = new Date();
  const y = now.getFullYear().toString().slice(-2);
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const rand = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `TJN-${y}${m}${d}-${rand}`;
}

export function isOnSale(product: {
  price: number;
  compare_at_price?: number | null;
  sale_starts_at?: string | null;
  sale_ends_at?: string | null;
}): boolean {
  if (!product.compare_at_price || product.compare_at_price <= product.price) {
    return false;
  }
  const now = Date.now();
  if (product.sale_starts_at && new Date(product.sale_starts_at).getTime() > now) {
    return false;
  }
  if (product.sale_ends_at && new Date(product.sale_ends_at).getTime() < now) {
    return false;
  }
  return true;
}

export function salePercent(price: number, compareAt: number): number {
  if (compareAt <= price) return 0;
  return Math.round(((compareAt - price) / compareAt) * 100);
}

export function indianStates(): string[] {
  return [
    "Andhra Pradesh",
    "Arunachal Pradesh",
    "Assam",
    "Bihar",
    "Chhattisgarh",
    "Goa",
    "Gujarat",
    "Haryana",
    "Himachal Pradesh",
    "Jharkhand",
    "Karnataka",
    "Kerala",
    "Madhya Pradesh",
    "Maharashtra",
    "Manipur",
    "Meghalaya",
    "Mizoram",
    "Nagaland",
    "Odisha",
    "Punjab",
    "Rajasthan",
    "Sikkim",
    "Tamil Nadu",
    "Telangana",
    "Tripura",
    "Uttar Pradesh",
    "Uttarakhand",
    "West Bengal",
    "Andaman and Nicobar Islands",
    "Chandigarh",
    "Dadra and Nagar Haveli and Daman and Diu",
    "Delhi",
    "Jammu and Kashmir",
    "Ladakh",
    "Lakshadweep",
    "Puducherry",
  ];
}
