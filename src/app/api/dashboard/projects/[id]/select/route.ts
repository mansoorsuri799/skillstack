import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth-session";
import { isDataForSeoConfigured } from "@/lib/dataforseo/client";
import { selectActiveProject } from "@/lib/dashboard/project";

export async function POST(
  request: Request,
  props: { params: Promise<{ id: string }> },
) {
  const result = await requireUser(request);
  if ("response" in result) return result.response;
  const { user } = result;
  const params = await props.params;

  try {
    const { activeProject, projects } = await selectActiveProject(
      user.id,
      params.id,
    );

    return NextResponse.json({
      activeProject,
      project: activeProject,
      projects,
      dataForSeoConfigured: isDataForSeoConfigured(),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not select project";
    return NextResponse.json({ message }, { status: 400 });
  }
}
