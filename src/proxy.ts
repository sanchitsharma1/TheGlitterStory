import { type NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip session refresh for static-ish noise that was flooding logs / adding latency
  if (
    pathname === "/sw.js" ||
    pathname === "/manifest.json" ||
    pathname === "/favicon.ico" ||
    pathname.startsWith("/brand/")
  ) {
    return NextResponse.next();
  }

  return updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
