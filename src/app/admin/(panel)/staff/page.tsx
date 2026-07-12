"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { StaffPermissions, StaffProfile } from "@/types";
import { DEFAULT_STAFF_PERMISSIONS } from "@/types";

export default function AdminStaffPage() {
  const [staffList, setStaffList] = useState<StaffProfile[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
    full_name: "",
    role: "staff" as "staff" | "super_admin",
  });
  const [permissions, setPermissions] = useState<StaffPermissions>({
    ...DEFAULT_STAFF_PERMISSIONS,
  });

  async function load() {
    const res = await fetch("/api/admin/staff");
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Failed");
      return;
    }
    setStaffList(data.staff ?? []);
  }

  useEffect(() => {
    load().catch(() => setError("Could not load staff (super admin only)"));
  }, []);

  async function invite(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMsg(null);
    const res = await fetch("/api/admin/staff", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        permissions: form.role === "super_admin" ? undefined : permissions,
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Failed");
      return;
    }
    setMsg("Staff account created");
    setForm({ email: "", password: "", full_name: "", role: "staff" });
    await load();
  }

  async function toggleActive(member: StaffProfile) {
    const res = await fetch(`/api/admin/staff/${member.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: !member.is_active }),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Update failed");
      return;
    }
    await load();
  }

  return (
    <div>
      <h1 className="font-display text-3xl">Staff access</h1>
      <p className="text-sm text-ink/55">
        Super admin can create staff logins and control what each person can access
      </p>

      <form
        onSubmit={invite}
        className="mt-8 max-w-2xl space-y-3 rounded-2xl border border-ink/10 bg-white p-5"
      >
        <h2 className="font-display text-xl">Add staff member</h2>
        <Input
          required
          placeholder="Full name"
          value={form.full_name}
          onChange={(e) => setForm({ ...form, full_name: e.target.value })}
        />
        <Input
          required
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <Input
          required
          type="password"
          minLength={8}
          placeholder="Temporary password (min 8 chars)"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <select
          className="h-11 w-full rounded-xl border border-ink/15 px-3 text-sm"
          value={form.role}
          onChange={(e) =>
            setForm({ ...form, role: e.target.value as "staff" | "super_admin" })
          }
        >
          <option value="staff">Staff</option>
          <option value="super_admin">Super admin</option>
        </select>

        {form.role === "staff" && (
          <div className="grid grid-cols-2 gap-2 rounded-xl bg-ivory/80 p-3 text-sm">
            {(Object.keys(DEFAULT_STAFF_PERMISSIONS) as (keyof StaffPermissions)[]).map(
              (key) => (
                <label key={key} className="flex items-center gap-2 capitalize">
                  <input
                    type="checkbox"
                    checked={permissions[key]}
                    onChange={(e) =>
                      setPermissions({ ...permissions, [key]: e.target.checked })
                    }
                  />
                  {key}
                </label>
              )
            )}
          </div>
        )}

        {error && <p className="text-sm text-red-600">{error}</p>}
        {msg && <p className="text-sm text-emerald-700">{msg}</p>}
        <Button type="submit" disabled={loading}>
          {loading ? "Creating…" : "Create account"}
        </Button>
      </form>

      <div className="mt-8 overflow-hidden rounded-2xl border border-ink/10 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-ink/10 bg-ivory/80 text-xs uppercase tracking-wider text-ink/50">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {staffList.map((s) => (
              <tr key={s.id} className="border-b border-ink/5">
                <td className="px-4 py-3 font-medium">{s.full_name}</td>
                <td className="px-4 py-3">{s.email}</td>
                <td className="px-4 py-3 capitalize">{s.role.replace("_", " ")}</td>
                <td className="px-4 py-3">{s.is_active ? "Active" : "Disabled"}</td>
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    className="text-xs uppercase tracking-wider text-ink/60"
                    onClick={() => toggleActive(s)}
                  >
                    {s.is_active ? "Disable" : "Enable"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
