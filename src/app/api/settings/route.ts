import { NextResponse } from "next/server";
import { getSiteConfig } from "@/lib/settings";

export async function GET() {
  const config = await getSiteConfig();
  return NextResponse.json(config);
}
