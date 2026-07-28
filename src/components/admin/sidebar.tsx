"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Tags,
  ShoppingBag,
  Ticket,
  Users,
  Settings,
  Bell,
  LogOut,
  Store,
  MessageSquareQuote,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import type { StaffProfile } from "@/types";
import { canAccess, isSuperAdmin } from "@/lib/auth/staff-client";

const links = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, permission: "dashboard" as const },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag, permission: "orders" as const },
  { href: "/admin/products", label: "Products", icon: Package, permission: "products" as const },
  { href: "/admin/categories", label: "Categories", icon: Tags, permission: "categories" as const },
  { href: "/admin/coupons", label: "Coupons", icon: Ticket, permission: "coupons" as const },
  { href: "/admin/notifications", label: "Alerts", icon: Bell, permission: "dashboard" as const },
  { href: "/admin/reviews", label: "Reviews", icon: MessageSquareQuote, permission: "dashboard" as const },
  { href: "/admin/staff", label: "Staff", icon: Users, permission: "staff" as const, superOnly: true },
  { href: "/admin/settings", label: "Settings", icon: Settings, permission: "settings" as const },
];

export function AdminSidebar({ staff }: { staff: StaffProfile }) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-ink/10 bg-white">
      <div className="border-b border-ink/10 px-5 py-5">
        <p className="font-display text-xl text-ink">The Jewel Nest</p>
        <p className="text-xs text-ink/45">
          {staff.full_name} · {staff.role === "super_admin" ? "Super Admin" : "Staff"}
        </p>
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {links.map((link) => {
          if (link.superOnly && !isSuperAdmin(staff)) return null;
          if (!canAccess(staff, link.permission) && !isSuperAdmin(staff)) return null;
          // settings: super admin always; staff only if permission
          if (link.href === "/admin/settings" && !isSuperAdmin(staff) && !canAccess(staff, "settings")) {
            return null;
          }
          const active =
            link.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(link.href);
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm transition",
                active
                  ? "bg-ink text-ivory"
                  : "text-ink/70 hover:bg-ink/5 hover:text-ink"
              )}
            >
              <Icon size={16} />
              {link.label}
            </Link>
          );
        })}
      </nav>
      <div className="space-y-1 border-t border-ink/10 p-3">
        <Link
          href="/"
          className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-ink/70 hover:bg-ink/5"
        >
          <Store size={16} />
          View store
        </Link>
        <button
          type="button"
          onClick={logout}
          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-ink/70 hover:bg-ink/5"
        >
          <LogOut size={16} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
