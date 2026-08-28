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
        ? " Google sign-in could not be completed. Please ensure Authorized Redirect URIs in Google Cloud Console includes the callback URL."
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
    const project = await getProjectDocument(userId, true);
    const tokens = await exchangeCodeForTokens(code, redirectUri);
    const refreshToken = tokens.refresh_token || project.gscRefreshToken;
    if (!refreshToken) {
      throw new Error(
        "Google did not return a refresh token. Please remove SkillStack from your Google Account permissions (myaccount.google.com/connections) and connect again.",
      );
    }

    const sites = await listGscSites(tokens.access_token!);
    if (sites.length === 0) {
      throw new Error(
        "No verified Search Console properties found on this Google account. Please verify your website property in Google Search Console first.",
      );
    }

    const tokenBundle = {
      refreshToken,
      accessToken: tokens.access_token!,
      expiresAt: new Date(Date.now() + (tokens.expires_in ?? 3600) * 1000),
    };

    const hasCustomDomain = project.domain && project.domain !== "example.com";
    const matching = hasCustomDomain
      ? listMatchingGscSites(sites, project.domain)
      : [];

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

    // If no exact match with project.domain or project domain is default example.com:
    if (sites.length === 1) {
      // Connect directly to the only available property
      await saveGscConnection(userId, {
        ...tokenBundle,
        siteUrl: sites[0],
      });
      return NextResponse.redirect(`${authUrl}/dashboard/gsc?connected=1`);
    }

    // Multiple properties available: allow user to select the right one
    await saveGscPendingConnection(userId, {
      ...tokenBundle,
      siteOptions: sites,
    });
    return NextResponse.redirect(`${authUrl}/dashboard/gsc?select=1`);
  } catch (err) {
    const message = err instanceof Error ? err.message : "GSC connection failed";
    return NextResponse.redirect(
      `${authUrl}/dashboard/gsc?error=${encodeURIComponent(message)}`,
    );
  }
}
