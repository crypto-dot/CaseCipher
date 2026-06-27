"use client";

import { AuthView } from "@neondatabase/auth/react";

import { AuthPageShell } from "@/components/auth/auth-page-shell";

export default function SignInPage() {
  return (
    <AuthPageShell eyebrow="Welcome back">
      <AuthView
        view="SIGN_IN"
        localization={{
          EMAIL: "Email",
          PASSWORD: "Password",
          SIGN_IN: "Sign in",
        }}
        redirectTo="/dashboard"
      />
    </AuthPageShell>
  );
}
