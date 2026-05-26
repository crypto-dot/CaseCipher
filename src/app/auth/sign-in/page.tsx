"use client";

import Link from "next/link";
import { useActionState } from "react";
import { AuthPageShell } from "@/components/auth/auth-page-shell";
import {  AuthView } from "@neondatabase/auth-ui";
import { signInWithEmail } from "./actions";

export default function SignInPage() {
  const [state, formAction, isPending] = useActionState(signInWithEmail, null);

  return (
    <AuthPageShell
      >
        <AuthView
          view="SIGN_IN"
          localization={{
            EMAIL: "Email",
            PASSWORD: "Password",
            SIGN_IN: "Sign in",
            SIGN_IN_DESCRIPTION: "Sign in to your account",
          }}
        />

    </AuthPageShell>
  );
}
