import { NextResponse } from "next/server";
import { auth } from "@/auth";
import type { Session } from "next-auth";

/** Re-export `auth()` for server components and Route Handlers. */
export { auth as getSession };

/**
 * Asserts an authenticated user is present.
 * Returns `{ user }` on success.
 * Returns `{ response }` — a ready-to-return 401 JSON response — when the
 * request is unauthenticated, so the caller can do:
 *
 * ```ts
 * const result = await requireUser();
 * if ("response" in result) return result.response;
 * const { user } = result;
 * ```
 */
export async function requireUser(): Promise<
  | { user: NonNullable<Session["user"]> & { id: string } }
  | { response: NextResponse }
> {
  const session = await auth();
  if (!session?.user?.id) {
    return {
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }
  return { user: session.user as NonNullable<Session["user"]> & { id: string } };
}
