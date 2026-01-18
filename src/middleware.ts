import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// Routes that should redirect to dashboard if already authenticated
const authRoutes = [
  "/auth/sign-in",
  "/auth/sign-up",
  "/auth/forgot-password",
  "/auth/reset-password",
];
// Note: /auth/verify-email is handled client-side - verified users are redirected,
// unverified users can access to complete verification

/**
 * Check if user has any auth session cookie.
 * Neon Auth (via Better Auth) may use different cookie names depending on configuration.
 */
function hasAuthSession(request: NextRequest): boolean {
  const cookies = request.cookies;
  
  // Check common Better Auth / Neon Auth cookie patterns
  
    if (cookies.get("__Secure-neon-auth.session_token")?.value) {
      return true;
    }

  
  // Also check for any cookie containing "session" or "auth"
  for (const cookie of cookies.getAll()) {
    if (
      cookie.name.toLowerCase().includes("session") ||
      cookie.name.toLowerCase().includes("auth")
    ) {
      return true;
    }
  }
  
  return false;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAuthenticated = hasAuthSession(request);

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
