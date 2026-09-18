import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth-cookie";

function authConfigured(): boolean {
  return Boolean(
    process.env.AUTH_SECRET?.trim() && process.env.DATABASE_URL?.trim(),
  );
}

export function proxy(request: NextRequest) {
  if (!authConfigured()) {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;
  if (pathname === "/login") {
    return NextResponse.next();
  }

  const hasSession = Boolean(request.cookies.get(SESSION_COOKIE)?.value);
  if (!hasSession) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/portal/:path*", "/login"],
};
