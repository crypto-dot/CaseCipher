"use client";

import { AuthView } from "@neondatabase/auth/react";

import { AuthPageShell } from "@/components/auth/auth-page-shell";

export default function SignUpPage() {
  return (
    <AuthPageShell
      eyebrow="Start your workspace"
      title="Create an account"
      description="Set up your CaseCipher access in a few seconds."
    >
      <AuthView
        view="SIGN_UP"
        localization={{
          EMAIL: "Email",
          PASSWORD: "Password",
          SIGN_UP: "Sign up",
          SIGN_UP_DESCRIPTION: "Sign up for a new account",
        }}
      />
    </AuthPageShell>
  );
}
