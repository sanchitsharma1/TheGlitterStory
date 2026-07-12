"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function MarkReadButton() {
  const router = useRouter();

  async function markAll() {
    await fetch("/api/admin/notifications/read", { method: "POST" });
    router.refresh();
  }

  return (
    <Button type="button" variant="secondary" onClick={markAll}>
      Mark all read
    </Button>
  );
}
