"use client";

import { AuthView, ForgotPasswordForm, NeonAuthUIProvider, ResetPasswordForm } from "@neondatabase/auth-ui";
import { useState } from "react";

import { AuthPageShell } from "@/components/auth/auth-page-shell";

import { authLocalization } from "@neondatabase/auth-ui";
export default function ForgotPasswordPage() {
  const [step, setStep] = useState<"forgot" | "reset">("forgot");
  const [email, setEmail] = useState<string>("");
  const isForgotStep = step === "forgot";

  return (

    <AuthPageShell>
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