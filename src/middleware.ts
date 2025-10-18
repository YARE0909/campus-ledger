import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

interface JwtPayload {
  role?: string;
  [key: string]: any;
}

export function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  const { pathname } = req.nextUrl;

  console.log("Middleware invoked for path:", pathname);
  console.log("Token exists:", !!token);

  // Helper function to decode JWT payload (Edge-compatible)
  const decodeJwtPayload = (tok: string): JwtPayload | null => {
    try {
      const parts = tok.split(".");
      if (parts.length < 2) return null;
      const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
      const padded = base64 + "===".slice((base64.length + 3) % 4);
      const json = atob(padded);
      return JSON.parse(json);
    } catch {
      return null;
    }
  };

  // Define public routes (routes that don't require authentication)
  const isPublicRoute = pathname === "/" || pathname === "/login";

  // Define protected routes
  const isProtectedRoute =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/super-admin");

  // 1. Block unauthenticated access to any protected route - REDIRECT TO LOGIN
  if (!token && isProtectedRoute) {
    console.log("No token found, redirecting to /login");
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // 2. Redirect authenticated users away from login page based on their role
  if (isPublicRoute && token) {
    const payload = decodeJwtPayload(token);
    if (payload?.role === "super_admin") {
      return NextResponse.redirect(new URL("/super-admin", req.url));
    }
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // 3. Role-based route protection for authenticated users
  if (token && isProtectedRoute) {
    const payload = decodeJwtPayload(token);

    if (!payload) {
      // Invalid token, redirect to login
      console.log("Invalid token, redirecting to /login");
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // Super admin trying to access regular dashboard
    if (payload.role === "super_admin" && pathname.startsWith("/dashboard")) {
      console.log(
        "Super admin accessing dashboard, redirecting to /super-admin"
      );
      return NextResponse.redirect(new URL("/super-admin", req.url));
    }

    // Non-super-admin trying to access super-admin routes
    if (payload.role !== "super_admin" && pathname.startsWith("/super-admin")) {
      console.log(
        "Non-super-admin accessing super-admin routes, redirecting to /dashboard"
      );
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/login",
    "/dashboard/:path*",
    "/admin/:path*",
    "/super-admin/:path*",
  ],
};
