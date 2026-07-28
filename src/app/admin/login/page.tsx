"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    e.stopPropagation();
    if (loading) return;

    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { error: signError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (signError) {
        setError(signError.message);
        setLoading(false);
        return;
      }

      // Hard navigation so the panel layout picks up the new session cookies cleanly
      window.location.assign("/admin");
    } catch {
      setError("Could not connect. Check Supabase env vars.");
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[100dvh] items-center justify-center px-4 py-8 pb-[max(2rem,env(safe-area-inset-bottom))]">
      <div className="w-full max-w-md rounded-3xl border border-ivory/10 bg-ivory p-6 shadow-2xl sm:p-8">
        <div className="mb-6 flex flex-col items-center text-center">
          {/* Plain img avoids next/image edge cases on SVG during auth screens */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/mark.svg" alt="The Jewel Nest" width={56} height={56} />
          <h1 className="mt-4 font-display text-3xl text-ink">Admin</h1>
          <p className="mt-1 text-sm text-ink/55">The Jewel Nest control room</p>
        </div>

        {/* method="post" prevents native GET reload to /admin/login? if JS is slow */}
        <form method="post" onSubmit={onSubmit} className="space-y-4" noValidate>
          <div>
            <label className="mb-1 block text-xs uppercase tracking-wider text-ink/50">
              Email
            </label>
            <Input
              type="email"
              name="email"
              required
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs uppercase tracking-wider text-ink/50">
              Password
            </label>
            <Input
              type="password"
              name="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>
          {error && (
            <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}
          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </Button>
        </form>
      </div>
    </div>
  );
}
