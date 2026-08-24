import { auth } from "@/lib/auth/server";
import {NextResponse, type NextRequest } from "next/server";

const protect = auth.middleware({
  loginUrl: "/auth/sign-in",
});

export default function proxy(request: NextRequest) {
  if (request.headers.has("next-action")) {
    return NextResponse.next();
  }
  return protect(request);
}

export const config = {
  matcher: [
    // Protected routes requiring authentication
    "/dashboard/:path*",
    "/account/:path*",
  ],
};
