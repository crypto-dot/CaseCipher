"use client";

import { AuthView } from "@neondatabase/auth/react";

import { AuthPageShell } from "@/components/auth/auth-page-shell";

export default function ForgotPasswordPage() {
  return (
    <AuthPageShell
      eyebrow="Recover access"
      title="Reset your password"
      description="Enter your email and we will send password reset instructions."
    >
      <AuthView
        view="FORGOT_PASSWORD"
        localization={{
          EMAIL: "Email",
          RESET_PASSWORD: "Reset Password",
          RESET_PASSWORD_DESCRIPTION: "Enter your email to reset your password",
          RESET_PASSWORD_ACTION: "Reset Password",
          RESET_PASSWORD_SUCCESS: "Password reset successful",
        }}
      />
    </AuthPageShell>
  );
}
