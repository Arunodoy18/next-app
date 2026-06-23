import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken, SESSION_COOKIE, ROLE_HOME } from "@/auth/server";
import type { AuthRole } from "@/types/userDoc";

const PROTECTED_ROUTES: Record<string, AuthRole[]> = {
  "/student": ["Student"],
  "/instructor": ["Instructor"],
  "/internal": ["Instructor", "Human Resources", "Project Management", "Business Development"],
  "/admin": ["Admin"],
};

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/login" || pathname === "/forgot") {
    const token = request.cookies.get(SESSION_COOKIE)?.value;
    if (token) {
      const payload = verifyToken(token);
      if (payload) {
        const home = ROLE_HOME[payload.role];
        return NextResponse.redirect(new URL(home, request.url));
      }
    }
    return NextResponse.next();
  }

  const matchedRoute = Object.keys(PROTECTED_ROUTES).find((route) =>
    pathname.startsWith(route)
  );

  if (!matchedRoute) return NextResponse.next();

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const payload = verifyToken(token);
  if (!payload) {
    const res = NextResponse.redirect(new URL("/login", request.url));
    res.cookies.set(SESSION_COOKIE, "", { maxAge: 0, path: "/" });
    return res;
  }

  const allowedRoles = PROTECTED_ROUTES[matchedRoute];
  if (!allowedRoles.includes(payload.role)) {
    const home = ROLE_HOME[payload.role];
    return NextResponse.redirect(new URL(home, request.url));
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-user-id", payload.userId);
  requestHeaders.set("x-user-role", payload.role);
  requestHeaders.set("x-user-name", payload.username);
  requestHeaders.set("x-user-email", payload.email);

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|icon.svg).*)",
  ],
};
