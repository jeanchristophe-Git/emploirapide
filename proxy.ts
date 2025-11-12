import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function proxy(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const isProtectedRoute =
    request.nextUrl.pathname.startsWith("/candidate") ||
    request.nextUrl.pathname.startsWith("/recruiter") ||
    request.nextUrl.pathname.startsWith("/cv-analysis");

  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL("/auth/signin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/candidate/:path*", "/recruiter/:path*", "/cv-analysis/:path*"],
};
