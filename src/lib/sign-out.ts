"use client";

import { signOut } from "next-auth/react";

/** Clear the Auth.js session, then hard-navigate so SessionProvider cannot keep a stale login UI. */
export async function signOutToHome() {
  await signOut({ redirect: false });
  window.location.assign("/");
}
