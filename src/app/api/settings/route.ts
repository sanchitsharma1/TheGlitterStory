import { NextResponse } from "next/server";
import { getSiteConfig } from "@/lib/settings";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const config = await getSiteConfig();
  return NextResponse.json(config, {
    headers: {
      "Cache-Control": "no-store, max-age=0",
    },
  });
}
