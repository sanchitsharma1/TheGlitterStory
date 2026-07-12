import { createClient } from "@/lib/supabase/server";
import type { StaffPermissions, StaffProfile, StaffRole } from "@/types";
import { DEFAULT_STAFF_PERMISSIONS } from "@/types";

export async function getSessionUser() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user;
  } catch {
    return null;
  }
}

export async function getStaffProfile(): Promise<StaffProfile | null> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    const { data, error } = await supabase
      .from("staff_profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    if (error || !data || !data.is_active) return null;

    return {
      ...data,
      permissions: {
        ...DEFAULT_STAFF_PERMISSIONS,
        ...(data.permissions as StaffPermissions),
      },
    } as StaffProfile;
  } catch {
    return null;
  }
}

export function canAccess(
  staff: StaffProfile | null,
  permission: keyof StaffPermissions
): boolean {
  if (!staff || !staff.is_active) return false;
  if (staff.role === "super_admin") return true;
  return Boolean(staff.permissions?.[permission]);
}

export function requirePermission(
  staff: StaffProfile | null,
  permission: keyof StaffPermissions
): asserts staff is StaffProfile {
  if (!canAccess(staff, permission)) {
    throw new Error("Unauthorized");
  }
}

export function isSuperAdmin(staff: StaffProfile | null): boolean {
  return Boolean(staff?.is_active && staff.role === "super_admin");
}

export type PermissionKey = keyof StaffPermissions;
export type { StaffRole };
