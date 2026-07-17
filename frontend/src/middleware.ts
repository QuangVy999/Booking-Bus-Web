import { jwtDecode } from "jwt-decode";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get(process.env.AUTH_COOKIE_NAME ?? "access_token")?.value;
  const path = request.nextUrl.pathname;
  
  // Public AI Chatbox under dashboard
  if (path.startsWith("/dashboard/ai-advisor") || path.startsWith("/api/chat")) {
    return NextResponse.next();
  }

  const isDashboard = path.startsWith("/dashboard");
  const isStaffRoute = path.startsWith("/staff");
  const isProfileRoute = path.startsWith("/profile");

  if (isDashboard || isStaffRoute || isProfileRoute) {
    if (!token) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("next", path);
      return NextResponse.redirect(loginUrl);
    }

    try {
      const payload: any = jwtDecode(token);
      
      if (isDashboard && payload.role !== "Admin") {
        return NextResponse.redirect(new URL("/", request.url));
      }
      
      if (isStaffRoute && payload.role !== "Check-in Staff" && payload.role !== "Admin") {
        return NextResponse.redirect(new URL("/", request.url));
      }

      // Profile is allowed for all authenticated users
    } catch (e) {
      const loginUrl = new URL("/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/staff/:path*", "/profile/:path*"],
};
