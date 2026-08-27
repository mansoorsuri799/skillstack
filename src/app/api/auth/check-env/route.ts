import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const check = {
    has_AUTH_SECRET: Boolean(process.env.AUTH_SECRET?.trim()),
    has_NEXTAUTH_SECRET: Boolean(process.env.NEXTAUTH_SECRET?.trim()),
    has_AUTH_URL: Boolean(process.env.AUTH_URL?.trim()),
    AUTH_URL_value: process.env.AUTH_URL?.trim() || null,
    has_AUTH_GOOGLE_ID: Boolean(
      (process.env.AUTH_GOOGLE_ID ||
        process.env.GOOGLE_CLIENT_ID ||
        process.env.GOOGLE_ID)?.trim(),
    ),
    has_AUTH_GOOGLE_SECRET: Boolean(
      (process.env.AUTH_GOOGLE_SECRET ||
        process.env.GOOGLE_CLIENT_SECRET ||
        process.env.GOOGLE_SECRET)?.trim(),
    ),
    has_MONGODB_URI: Boolean(process.env.MONGODB_URI?.trim()),
    node_env: process.env.NODE_ENV,
    vercel_env: process.env.VERCEL_ENV || null,
  };

  const missing: string[] = [];
  if (!check.has_AUTH_SECRET && !check.has_NEXTAUTH_SECRET) {
    missing.push("AUTH_SECRET (or NEXTAUTH_SECRET)");
  }
  if (!check.has_AUTH_GOOGLE_ID) {
    missing.push("AUTH_GOOGLE_ID (or GOOGLE_CLIENT_ID)");
  }
  if (!check.has_AUTH_GOOGLE_SECRET) {
    missing.push("AUTH_GOOGLE_SECRET (or GOOGLE_CLIENT_SECRET)");
  }
  if (!check.has_MONGODB_URI) {
    missing.push("MONGODB_URI");
  }

  return NextResponse.json({
    status: missing.length === 0 ? "ok" : "misconfigured",
    missing,
    details: check,
  });
}
