"use client";

import { redirect } from "next/navigation";
import { authClient } from "@/lib/auth/client";

export async function signOutAction() {
  await authClient.signOut();
  redirect("/");
}
