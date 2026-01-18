import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// Routes that should redirect to dashboard if already authenticated
const authRoutes = [
  "/auth/sign-in",
  "/auth/sign-up"
];
// Note: /auth/verify-email is handled client-side - verified users are redirected,
// unverified users can access to complete verification
function hasAuthSession(request: NextRequest): boolean {
  const cookies = request.cookies;
  const stackRefreshCookie = Array.from(cookies.getAll()).find(cookie => 
    cookie.name.startsWith("stack-refresh")
  );
  return !!stackRefreshCookie;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAuthenticated = false;

  // Redirect authenticated users away from auth pages
  if (
    isAuthenticated &&
    authRoutes.some((route) => pathname.startsWith(route))
  ) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Let protected routes handle their own auth via client-side checks
  // This avoids redirect loops when cookie names don't match exactly
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes
     */
    "/((?!_next/static|_next/image|favicon.ico|public|api).*)",
  ],
};
