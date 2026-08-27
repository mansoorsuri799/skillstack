import { NextResponse } from "next/server";
import { getAppBaseUrl, getGscRedirectUri } from "@/lib/app-url";
import { requireUser } from "@/lib/auth-session";
import { getGscConnectUrl, signOAuthState } from "@/lib/google/gsc";

export async function GET(request: Request) {
  const result = await requireUser(request);
  if ("response" in result) return result.response;
  const { user } = result;

  try {
    const redirectUri = getGscRedirectUri(request);
    const state = signOAuthState(user.id, redirectUri);
    const url = getGscConnectUrl(state, redirectUri);
    return NextResponse.redirect(url);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Connect failed";
    return NextResponse.redirect(
      new URL(
        `/dashboard/gsc?error=${encodeURIComponent(message)}`,
        getAppBaseUrl(request),
      ),
    );
  }
}
