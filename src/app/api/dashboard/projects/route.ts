import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth-session";
import { isDataForSeoConfigured } from "@/lib/dataforseo/client";
import { isFirecrawlConfigured } from "@/lib/firecrawl/search";
import {
  createProjectForUser,
  getProjectForUser,
  listProjectsForUser,
} from "@/lib/dashboard/project";

export async function GET(request: Request) {
  const result = await requireUser(request);
  if ("response" in result) return result.response;
  const { user } = result;

  const [activeProject, projects] = await Promise.all([
    getProjectForUser(user.id),
    listProjectsForUser(user.id),
  ]);

  return NextResponse.json({
    activeProject,
    project: activeProject,
    projects,
    dataForSeoConfigured: isDataForSeoConfigured(),
    firecrawlConfigured: isFirecrawlConfigured(),
  });
}

export async function POST(request: Request) {
  const result = await requireUser(request);
  if ("response" in result) return result.response;
  const { user } = result;

  try {
    const body = await request.json();
    const domain = String(body.domain ?? "").trim();
    const name = body.name ? String(body.name).trim() : undefined;
    const locationCode =
      body.locationCode !== undefined ? Number(body.locationCode) : undefined;
    const languageCode =
      body.languageCode !== undefined ? String(body.languageCode) : undefined;

    if (!domain) {
      return NextResponse.json(
        { message: "Domain is required" },
        { status: 400 },
      );
    }

    const { activeProject, projects } = await createProjectForUser(user.id, {
      domain,
      name,
      locationCode,
      languageCode,
    });

    return NextResponse.json({
      activeProject,
      project: activeProject,
      projects,
      dataForSeoConfigured: isDataForSeoConfigured(),
      firecrawlConfigured: isFirecrawlConfigured(),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not create project";
    return NextResponse.json({ message }, { status: 400 });
  }
}
