"use client";

import { SessionProvider } from "next-auth/react";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider
      // Re-fetch the session every 24 hours (aligned with updateAge in src/auth.ts)
      // so the client stays in sync without hammering the server.
      refetchInterval={24 * 60 * 60}
      refetchOnWindowFocus={true}
    >
      {children}
    </SessionProvider>
  );
}
