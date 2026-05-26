"use client";

import Link from "next/link";
import { useActionState } from "react";

import { AuthField } from "@/components/auth/auth-field";
import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { Button } from "@/components/ui/button";

import { signUpWithEmail } from "./actions";
import { AuthView } from "@neondatabase/auth/react";

export default function SignUpPage() {
  const [state, formAction, isPending] = useActionState(signUpWithEmail, null);

  return (
    <AuthPageShell>
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
