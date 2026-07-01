import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken, SESSION_COOKIE, ROLE_HOME } from "@/auth/server";
import type { AuthRole } from "@/types/userDoc";

const PROTECTED_ROUTES: Record<string, AuthRole[]> = {
  "/consultant": ["Consultant"],
  "/instructor": ["Instructor"],
  "/internal": ["Instructor", "Human Resources", "Project Management", "Business Development"],
  "/admin": ["Admin"],
};
const PUBLIC_ROUTES = ["/", "/logout", "/verify"];

function forward(request: NextRequest, extra?: Record<string, string>) {
  const headers = new Headers(request.headers);
  headers.set("x-pathname", request.nextUrl.pathname);
  if (extra) for (const [k, v] of Object.entries(extra)) headers.set(k, v);
  return NextResponse.next({ request: { headers } });
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/login") {
    if (request.nextUrl.searchParams.has("token")) {
      return forward(request);
    }
    const token = request.cookies.get(SESSION_COOKIE)?.value;
    if (token) {
      const payload = verifyToken(token);
      if (payload) {
        const home = ROLE_HOME[payload.role];
        return NextResponse.redirect(new URL(home, request.url));
      }
    }
    return forward(request);
  }

  const matchedRoute = Object.keys(PROTECTED_ROUTES).find((route) =>
    pathname.startsWith(route)
  );

  if (!matchedRoute) {
    if (PUBLIC_ROUTES.includes(pathname) || pathname.includes(".")) {
      return forward(request);
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

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

  return forward(request, {
    "x-user-id": payload.userId,
    "x-user-role": payload.role,
    "x-user-name": payload.name,
    "x-user-email": payload.email,
  });
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|icon.svg).*)",
  ],
};
