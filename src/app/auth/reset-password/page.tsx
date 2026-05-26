"use client";

import { AuthView, ForgotPasswordForm, NeonAuthUIProvider, ResetPasswordForm } from "@neondatabase/auth-ui";
import { useState } from "react";

import { AuthPageShell } from "@/components/auth/auth-page-shell";

import { authLocalization } from "@neondatabase/auth-ui";
export default function ForgotPasswordPage() {


  return (

    <AuthPageShell>
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