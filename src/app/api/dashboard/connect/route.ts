import crypto from "crypto";
import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth-session";
import { connectDB } from "@/lib/db";
import { updateProjectSettings } from "@/lib/dashboard/project";
import { User } from "@/models/User";

function generateApiKey() {
  return `ss_${crypto.randomBytes(24).toString("hex")}`;
}

export async function GET(request: Request) {
  const result = await requireUser(request);
  if ("response" in result) return result.response;
  const { user } = result;

  await connectDB();
  const dbUser = await User.findById(user.id).select("+dashboardApiKey");
  const authUrl = process.env.AUTH_URL?.trim() ?? "http://localhost:3000";

  return NextResponse.json({
    apiKey: dbUser?.dashboardApiKey ?? null,
    apiBaseUrl: `${authUrl}/api/dashboard`,
    mcpConfigured: Boolean(dbUser?.dashboardApiKey),
  });
}

export async function POST(request: Request) {
  const result = await requireUser(request);
  if ("response" in result) return result.response;
  const { user } = result;

  const body = await request.json().catch(() => ({}));
  const action = body.action as string | undefined;

  await connectDB();
  const dbUser = await User.findById(user.id).select("+dashboardApiKey");
  if (!dbUser) {
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }

  if (action === "revoke") {
    dbUser.dashboardApiKey = null;
    await dbUser.save();
    await updateProjectSettings(user.id, { mcpConnected: false });
    return NextResponse.json({ ok: true, apiKey: null });
  }

  if (!dbUser.dashboardApiKey) {
    dbUser.dashboardApiKey = generateApiKey();
    await dbUser.save();
  }

  await updateProjectSettings(user.id, { mcpConnected: true });

  const authUrl = process.env.AUTH_URL?.trim() ?? "http://localhost:3000";

  return NextResponse.json({
    apiKey: dbUser.dashboardApiKey,
    apiBaseUrl: `${authUrl}/api/dashboard`,
    mcpConfigured: true,
  });
}
