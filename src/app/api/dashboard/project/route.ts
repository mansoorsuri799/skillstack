import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth-session";
import { isDataForSeoConfigured } from "@/lib/dataforseo/client";
import { isFirecrawlConfigured } from "@/lib/firecrawl/search";
import {
  getProjectForUser,
  updateProjectDomain,
  updateProjectSettings,
} from "@/lib/dashboard/project";

export async function GET(request: Request) {
  const result = await requireUser(request);
  if ("response" in result) return result.response;
  const { user } = result;

  const project = await getProjectForUser(user.id);
  return NextResponse.json({
    project,
    dataForSeoConfigured: isDataForSeoConfigured(),
    firecrawlConfigured: isFirecrawlConfigured(),
  });
}

export async function PATCH(request: Request) {
  const result = await requireUser(request);
  if ("response" in result) return result.response;
  const { user } = result;

  try {
    const body = await request.json();

    if (
      body.locationCode !== undefined ||
      body.languageCode !== undefined ||
      body.mcpConnected !== undefined ||
      body.gscSiteUrl !== undefined
    ) {
      const project = await updateProjectSettings(user.id, {
        domain: body.domain ? String(body.domain) : undefined,
        name: body.name ? String(body.name) : undefined,
        locationCode:
          body.locationCode !== undefined ? Number(body.locationCode) : undefined,
        languageCode:
          body.languageCode !== undefined ? String(body.languageCode) : undefined,
        mcpConnected:
          body.mcpConnected !== undefined ? Boolean(body.mcpConnected) : undefined,
        gscSiteUrl:
          body.gscSiteUrl !== undefined ? String(body.gscSiteUrl) : undefined,
      });
      return NextResponse.json({ project });
    }

    const project = await updateProjectDomain(
      user.id,
      String(body.domain ?? ""),
      body.name ? String(body.name) : undefined,
    );
    return NextResponse.json({ project });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not update project";
    return NextResponse.json({ message }, { status: 400 });
  }
}
