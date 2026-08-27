import { NextResponse } from "next/server";
import { getAppBaseUrl } from "@/lib/app-url";
import {
  exchangeCodeForTokens,
  listGscSites,
  listMatchingGscSites,
  verifyOAuthState,
} from "@/lib/google/gsc";
import {
  getProjectDocument,
  saveGscConnection,
  saveGscPendingConnection,
} from "@/lib/dashboard/project";

export async function GET(request: Request) {
  const authUrl = getAppBaseUrl(request);
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  if (error) {
    const hint =
      error === "redirect_uri_mismatch"
        ? " Google sign-in could not be completed. Please try again."
        : "";
    return NextResponse.redirect(
      `${authUrl}/dashboard/gsc?error=${encodeURIComponent(error + hint)}`,
    );
  }

  if (!code || !state) {
    return NextResponse.redirect(
      `${authUrl}/dashboard/gsc?error=${encodeURIComponent("Missing OAuth code")}`,
    );
  }

  const verified = verifyOAuthState(state);
  if (!verified) {
    return NextResponse.redirect(
      `${authUrl}/dashboard/gsc?error=${encodeURIComponent("Invalid or expired OAuth state")}`,
    );
  }

  const { userId, redirectUri } = verified;

  try {
    const tokens = await exchangeCodeForTokens(code, redirectUri);
    const refreshToken = tokens.refresh_token;
    if (!refreshToken) {
      throw new Error(
        "Google did not return a refresh token. Disconnect any old connection in your Google account and try again.",
      );
    }

    const sites = await listGscSites(tokens.access_token!);
    if (sites.length === 0) {
      throw new Error(
        "No verified Search Console properties found on this Google account.",
      );
    }

    const project = await getProjectDocument(userId);
    const matching = listMatchingGscSites(sites, project.domain);
    const tokenBundle = {
      refreshToken,
      accessToken: tokens.access_token!,
      expiresAt: new Date(Date.now() + (tokens.expires_in ?? 3600) * 1000),
    };

    if (matching.length === 1) {
      await saveGscConnection(userId, {
        ...tokenBundle,
        siteUrl: matching[0],
      });
      return NextResponse.redirect(`${authUrl}/dashboard/gsc?connected=1`);
    }

    if (matching.length > 1) {
      await saveGscPendingConnection(userId, {
        ...tokenBundle,
        siteOptions: matching,
      });
      return NextResponse.redirect(`${authUrl}/dashboard/gsc?select=1`);
    }

    const preview = sites.slice(0, 6).join(", ");
    throw new Error(
      `No Search Console property matches ${project.domain}. Properties on this Google account: ${preview}. Update your project domain in dashboard settings, then connect again.`,
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "GSC connection failed";
    return NextResponse.redirect(
      `${authUrl}/dashboard/gsc?error=${encodeURIComponent(message)}`,
    );
  }
}
