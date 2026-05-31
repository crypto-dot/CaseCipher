"use client";

import { AuthView } from "@neondatabase/auth/react";

import { AuthPageShell } from "@/components/auth/auth-page-shell";

export default function ResetPasswordPage() {
  return (
    <AuthPageShell eyebrow="Secure reset">
      <AuthView
        view="RESET_PASSWORD"
        localization={{
          NEW_PASSWORD: "New Password",
          CONFIRM_PASSWORD: "Confirm New Password",
          RESET_PASSWORD: "Reset Password",
          RESET_PASSWORD_DESCRIPTION: "Enter your new password and confirm it",
          RESET_PASSWORD_ACTION: "Reset Password",
          RESET_PASSWORD_SUCCESS: "Password reset successful",
        }}
      />
    </AuthPageShell>
  );
}
