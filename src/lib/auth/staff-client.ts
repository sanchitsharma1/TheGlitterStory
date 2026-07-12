import type { StaffPermissions, StaffProfile } from "@/types";

export function canAccess(
  staff: StaffProfile | null,
  permission: keyof StaffPermissions
): boolean {
  if (!staff || !staff.is_active) return false;
  if (staff.role === "super_admin") return true;
  return Boolean(staff.permissions?.[permission]);
}

export function isSuperAdmin(staff: StaffProfile | null): boolean {
  return Boolean(staff?.is_active && staff.role === "super_admin");
}
