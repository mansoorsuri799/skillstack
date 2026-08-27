import { NextResponse } from "next/server";
import {
  exchangeCodeForTokens,
  listGscSites,
  pickGscSiteForDomain,
  verifyOAuthState,
} from "@/lib/google/gsc";
import { saveGscConnection, getProjectDocument } from "@/lib/dashboard/project";

export async function GET(request: Request) {
  const authUrl = process.env.AUTH_URL?.trim() ?? "http://localhost:3000";
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  if (error) {
    return NextResponse.redirect(
      `${authUrl}/dashboard/gsc?error=${encodeURIComponent(error)}`,
    );
  }

  if (!code || !state) {
    return NextResponse.redirect(
      `${authUrl}/dashboard/gsc?error=${encodeURIComponent("Missing OAuth code")}`,
    );
  }

  const userId = verifyOAuthState(state);
  if (!userId) {
    return NextResponse.redirect(
      `${authUrl}/dashboard/gsc?error=${encodeURIComponent("Invalid or expired OAuth state")}`,
    );
  }

  try {
    const tokens = await exchangeCodeForTokens(code);
    const refreshToken = tokens.refresh_token;
    if (!refreshToken) {
      throw new Error(
        "Google did not return a refresh token. Try disconnecting and reconnecting with consent.",
      );
    }

    const sites = await listGscSites(tokens.access_token!);
    if (sites.length === 0) {
      throw new Error(
        "No verified Search Console properties found on this Google account.",
      );
    }

    const project = await getProjectDocument(userId);
    const siteUrl = pickGscSiteForDomain(sites, project.domain);
    if (!siteUrl) {
      throw new Error("Could not match a Search Console property to your project domain.");
    }

    await saveGscConnection(userId, {
      refreshToken,
      accessToken: tokens.access_token!,
      expiresAt: new Date(Date.now() + (tokens.expires_in ?? 3600) * 1000),
      siteUrl,
    });

    return NextResponse.redirect(`${authUrl}/dashboard/gsc?connected=1`);
  } catch (err) {
    const message = err instanceof Error ? err.message : "GSC connection failed";
    return NextResponse.redirect(
      `${authUrl}/dashboard/gsc?error=${encodeURIComponent(message)}`,
    );
  }
}
