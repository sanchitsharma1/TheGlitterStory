import { redirect } from "next/navigation";
import { getStaffProfile } from "@/lib/auth/staff";
import { AdminShell } from "@/components/admin/admin-shell";

export default async function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const staff = await getStaffProfile();

  if (!staff) {
    redirect("/admin/login");
  }

  return <AdminShell staff={staff}>{children}</AdminShell>;
}
