import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decrypt } from "@/lib/session";

const adminRoutes = ["/admin"];
const authRoutes = ["/login", "/register"];

// Optimistic checks only (cookie-read, no DB hit) per Next.js auth guidance.
// Real authorization (role lookups etc.) still happens in the DAL.
export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isAdminRoute = adminRoutes.some((route) => path.startsWith(route));
  const isAuthRoute = authRoutes.some((route) => path.startsWith(route));

  if (!isAdminRoute && !isAuthRoute) {
    return NextResponse.next();
  }

  const cookie = request.cookies.get("session")?.value;
  const session = await decrypt(cookie);

  if (isAdminRoute && session?.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isAuthRoute && session?.userId) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/login", "/register"],
};
