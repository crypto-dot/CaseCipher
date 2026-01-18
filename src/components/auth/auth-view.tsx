"use client";

import { AuthView as NeonAuthView } from "@neondatabase/neon-js/auth/react/ui";

interface AuthViewProps {
  pathname: "sign-in" | "sign-up" | "forgot-password" | "reset-password";
}

export function AuthView({ pathname }: AuthViewProps) {
  // After sign-up, redirect to verification page
  if (pathname === "sign-up") {
    return <NeonAuthView pathname="sign-up" redirectTo="/auth/verify-email" />;
  }
  
  return <NeonAuthView pathname={pathname} />;
}
