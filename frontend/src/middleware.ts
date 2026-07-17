import { jwtDecode } from "jwt-decode";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get(process.env.AUTH_COOKIE_NAME ?? "access_token")?.value;
  const isDashboard = request.nextUrl.pathname.startsWith("/dashboard");

  if (isDashboard) {
    if (!token) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("next", request.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }

    try {
      // Basic decoding to check role. This does not verify the signature,
      // but it's okay for an initial check before the server component does a secure check.
      const payload: any = jwtDecode(token);
      if (payload.role !== "Admin" && payload.role !== "Staff") {
        // Redirect non-admins away from dashboard
        return NextResponse.redirect(new URL("/profile", request.url));
      }
    } catch (e) {
      // Invalid token
      const loginUrl = new URL("/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
