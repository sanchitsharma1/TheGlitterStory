import { redirect } from "next/navigation";
import { getStaffProfile } from "@/lib/auth/staff";
import { AdminSidebar } from "@/components/admin/sidebar";

export default async function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const staff = await getStaffProfile();

  if (!staff) {
    redirect("/admin/login");
  }

  return (
    <div className="flex min-h-screen bg-ivory text-ink">
      <AdminSidebar staff={staff} />
      <div className="flex min-w-0 flex-1 flex-col">
        <main className="flex-1 p-6 sm:p-8">{children}</main>
      </div>
    </div>
  );
}
