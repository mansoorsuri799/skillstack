import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth-session";
import { deleteProjectById, updateProjectById } from "@/lib/dashboard/project";

export async function PATCH(
  request: Request,
  props: { params: Promise<{ id: string }> },
) {
  const result = await requireUser(request);
  if ("response" in result) return result.response;
  const { user } = result;
  const params = await props.params;

  try {
    const body = await request.json();
    const { activeProject, projects } = await updateProjectById(
      user.id,
      params.id,
      {
        name: body.name ? String(body.name).trim() : undefined,
        domain: body.domain ? String(body.domain).trim() : undefined,
        locationCode:
          body.locationCode !== undefined ? Number(body.locationCode) : undefined,
        languageCode:
          body.languageCode !== undefined ? String(body.languageCode) : undefined,
      },
    );

    return NextResponse.json({
      activeProject,
      project: activeProject,
      projects,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not update project";
    return NextResponse.json({ message }, { status: 400 });
  }
}

export async function DELETE(
  request: Request,
  props: { params: Promise<{ id: string }> },
) {
  const result = await requireUser(request);
  if ("response" in result) return result.response;
  const { user } = result;
  const params = await props.params;

  try {
    const { activeProject, projects } = await deleteProjectById(
      user.id,
      params.id,
    );

    return NextResponse.json({
      activeProject,
      project: activeProject,
      projects,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not delete project";
    return NextResponse.json({ message }, { status: 400 });
  }
}
