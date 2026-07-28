"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import type { StaffProfile } from "@/types";
import { canAccess, isSuperAdmin } from "@/lib/auth/staff-client";

const links = [
  {
    href: "/admin",
    label: "Dashboard",
    icon: LayoutDashboard,
    permission: "dashboard" as const,
  },
  {
    href: "/admin/orders",
    label: "Orders",
    icon: ShoppingBag,
    permission: "orders" as const,
  },
  {
    href: "/admin/products",
    label: "Products",
    icon: Package,
    permission: "products" as const,
  },
  {
    href: "/admin/categories",
    label: "Categories",
    icon: Tags,
    permission: "categories" as const,
  },
  {
    href: "/admin/coupons",
    label: "Coupons",
    icon: Ticket,
    permission: "coupons" as const,
  },
  {
    href: "/admin/notifications",
    label: "Alerts",
    icon: Bell,
    permission: "dashboard" as const,
  },
  {
    href: "/admin/reviews",
    label: "Reviews",
    icon: MessageSquareQuote,
    permission: "dashboard" as const,
  },
  {
    href: "/admin/staff",
    label: "Staff",
    icon: Users,
    permission: "staff" as const,
    superOnly: true,
  },
  {
    href: "/admin/settings",
    label: "Settings",
    icon: Settings,
    permission: "settings" as const,
  },
];

function NavLinks({
  staff,
  onNavigate,
}: {
  staff: StaffProfile;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <>
      {links.map((link) => {
        if (link.superOnly && !isSuperAdmin(staff)) return null;
        if (!canAccess(staff, link.permission) && !isSuperAdmin(staff))
          return null;
        if (
          link.href === "/admin/settings" &&
          !isSuperAdmin(staff) &&
          !canAccess(staff, "settings")
        ) {
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
            onClick={onNavigate}
            className={cn(
              "flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition active:scale-[0.99]",
              active
                ? "bg-ink text-ivory"
                : "text-ink/70 hover:bg-ink/5 hover:text-ink"
            )}
          >
            <Icon size={18} className="shrink-0" />
            {link.label}
          </Link>
        );
      })}
    </>
  );
}

export function AdminShell({
  staff,
  children,
}: {
  staff: StaffProfile;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Close drawer on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  async function logout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/admin/login");
    router.refresh();
  }

  const roleLabel =
    staff.role === "super_admin" ? "Super Admin" : "Staff";

  return (
    <div className="flex min-h-screen bg-ivory text-ink">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-ink/10 bg-white lg:flex">
        <div className="border-b border-ink/10 px-5 py-5">
          <p className="font-display text-xl text-ink">The Jewel Nest</p>
          <p className="mt-0.5 text-xs text-ink/45">
            {staff.full_name} · {roleLabel}
          </p>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          <NavLinks staff={staff} />
        </nav>
        <div className="space-y-1 border-t border-ink/10 p-3">
          <Link
            href="/"
            className="flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-ink/70 hover:bg-ink/5"
          >
            <Store size={18} />
            View store
          </Link>
          <button
            type="button"
            onClick={logout}
            className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-ink/70 hover:bg-ink/5"
          >
            <LogOut size={18} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-ink/40 backdrop-blur-[1px]"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          />
          <aside className="absolute left-0 top-0 flex h-full w-[min(100%,18rem)] flex-col bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-ink/10 px-4 py-4">
              <div>
                <p className="font-display text-lg text-ink">Admin</p>
                <p className="text-xs text-ink/45">
                  {staff.full_name} · {roleLabel}
                </p>
              </div>
              <button
                type="button"
                className="rounded-full p-2 hover:bg-ink/5"
                onClick={() => setOpen(false)}
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>
            <nav className="flex-1 space-y-1 overflow-y-auto p-3">
              <NavLinks staff={staff} onNavigate={() => setOpen(false)} />
            </nav>
            <div className="space-y-1 border-t border-ink/10 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
              <Link
                href="/"
                onClick={() => setOpen(false)}
                className="flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-ink/70 hover:bg-ink/5"
              >
                <Store size={18} />
                View store
              </Link>
              <button
                type="button"
                onClick={logout}
                className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-ink/70 hover:bg-ink/5"
              >
                <LogOut size={18} />
                Sign out
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top bar */}
        <header className="sticky top-0 z-40 flex items-center justify-between gap-3 border-b border-ink/10 bg-ivory/95 px-3 py-3 backdrop-blur lg:hidden">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-ink/10 bg-white text-ink shadow-sm"
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
          <div className="min-w-0 flex-1 text-center">
            <p className="truncate font-display text-lg text-ink">
              The Jewel Nest
            </p>
            <p className="truncate text-[11px] uppercase tracking-[0.12em] text-ink/45">
              Admin
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-ink/10 bg-white text-ink shadow-sm"
            aria-label="View store"
          >
            <Store size={18} />
          </Link>
        </header>

        <main className="flex-1 px-3 py-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:px-6 sm:py-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
