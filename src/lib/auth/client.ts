"use client";

import { createAuthClient } from "@neondatabase/auth/next";

export const authClient = createAuthClient();

export type Session = typeof authClient.$Infer.Session;
export type User = Session["user"];
