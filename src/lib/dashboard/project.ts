import mongoose, { type HydratedDocument } from "mongoose";
import { connectDB } from "@/lib/db";
import { normalizeDomain } from "@/lib/dataforseo/client";
import { Project, toProjectDto, type ProjectDocument, type ProjectDto } from "@/models/Project";
import { User } from "@/models/User";

type ProjectModel = HydratedDocument<ProjectDocument>;

let droppedOldIndex = false;
async function ensureProjectIndexes() {
  if (droppedOldIndex) return;
  try {
    await Project.collection.dropIndex("userId_1");
  } catch {
    // Already dropped or does not exist
  }
  droppedOldIndex = true;
}

export function formatDomainToProjectName(domainInput: string): string {
  const clean = normalizeDomain(domainInput);
  if (!clean) return "My Site";
  const mainPart = clean.split(".")[0];
  if (!mainPart) return clean;
  return mainPart.charAt(0).toUpperCase() + mainPart.slice(1);
}

export async function getOrCreateProject(userId: string): Promise<ProjectModel> {
  await connectDB();
  await ensureProjectIndexes();

  const user = await User.findById(userId);
  if (user?.activeProjectId) {
    const active = await Project.findOne({
      _id: user.activeProjectId,
      userId,
    });
    if (active) return active;
  }

  // Fallback: pick the latest updated project for this user
  let project = await Project.findOne({ userId }).sort({ updatedAt: -1 });
  if (project) {
    if (user && String(user.activeProjectId) !== String(project._id)) {
      user.activeProjectId = project._id;
      await user.save();
    }
    return project;
  }

  // Create initial default project
  project = await Project.create({
    userId,
    name: "My Site",
    domain: "example.com",
  });

  if (user) {
    user.activeProjectId = project._id;
    await user.save();
  }

  return project;
}

export async function listProjectsForUser(userId: string): Promise<ProjectDto[]> {
  await connectDB();
  await ensureProjectIndexes();
  const projects = await Project.find({ userId }).sort({ updatedAt: -1 });
  return projects.map(toProjectDto);
}

export async function createProjectForUser(
  userId: string,
  data: {
    domain: string;
    name?: string;
    locationCode?: number;
    languageCode?: string;
  },
): Promise<{ activeProject: ProjectDto; projects: ProjectDto[] }> {
  await connectDB();
  await ensureProjectIndexes();

  const domain = normalizeDomain(data.domain);
  if (!domain || !domain.includes(".")) {
    throw new Error("Enter a valid domain (e.g. cardrummy.app)");
  }

  const name = data.name?.trim() || formatDomainToProjectName(domain);
  const project = await Project.create({
    userId,
    name,
    domain,
    locationCode: data.locationCode ?? 2840,
    languageCode: data.languageCode ?? "en",
  });

  await User.updateOne({ _id: userId }, { activeProjectId: project._id });

  const all = await listProjectsForUser(userId);
  return {
    activeProject: toProjectDto(project),
    projects: all,
  };
}

export async function selectActiveProject(
  userId: string,
  projectId: string,
): Promise<{ activeProject: ProjectDto; projects: ProjectDto[] }> {
  await connectDB();
  await ensureProjectIndexes();

  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    throw new Error("Invalid project ID");
  }

  const project = await Project.findOne({ _id: projectId, userId });
  if (!project) {
    throw new Error("Project not found");
  }

  // Bump updatedAt so it acts like recently accessed project
  project.updatedAt = new Date();
  await project.save();

  await User.updateOne({ _id: userId }, { activeProjectId: project._id });

  const all = await listProjectsForUser(userId);
  return {
    activeProject: toProjectDto(project),
    projects: all,
  };
}

export async function updateProjectById(
  userId: string,
  projectId: string,
  data: {
    name?: string;
    domain?: string;
    locationCode?: number;
    languageCode?: string;
  },
): Promise<{ activeProject: ProjectDto; projects: ProjectDto[] }> {
  await connectDB();
  await ensureProjectIndexes();

  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    throw new Error("Invalid project ID");
  }

  const project = await Project.findOne({ _id: projectId, userId });
  if (!project) {
    throw new Error("Project not found");
  }

  if (data.domain !== undefined) {
    const domain = normalizeDomain(data.domain);
    if (!domain || !domain.includes(".")) {
      throw new Error("Enter a valid domain (e.g. cardrummy.app)");
    }
    project.domain = domain;
  }

  if (data.name !== undefined && data.name.trim()) {
    project.name = data.name.trim();
  }

  if (data.locationCode !== undefined) {
    project.locationCode = data.locationCode;
  }

  if (data.languageCode !== undefined) {
    project.languageCode = data.languageCode;
  }

  await project.save();

  const user = await User.findById(userId);
  const activeId = user?.activeProjectId ? String(user.activeProjectId) : String(project._id);
  const activeDoc = String(project._id) === activeId ? project : await getOrCreateProject(userId);

  const all = await listProjectsForUser(userId);
  return {
    activeProject: toProjectDto(activeDoc),
    projects: all,
  };
}

export async function deleteProjectById(
  userId: string,
  projectId: string,
): Promise<{ activeProject: ProjectDto; projects: ProjectDto[] }> {
  await connectDB();
  await ensureProjectIndexes();

  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    throw new Error("Invalid project ID");
  }

  await Project.deleteOne({ _id: projectId, userId });

  // Get next active project
  const remaining = await Project.find({ userId }).sort({ updatedAt: -1 });
  let nextActive: ProjectModel;

  if (remaining.length === 0) {
    nextActive = await Project.create({
      userId,
      name: "My Site",
      domain: "example.com",
    });
  } else {
    nextActive = remaining[0];
  }

  await User.updateOne({ _id: userId }, { activeProjectId: nextActive._id });

  const all = await listProjectsForUser(userId);
  return {
    activeProject: toProjectDto(nextActive),
    projects: all,
  };
}

export async function getProjectDocument(userId: string, withSecrets = false) {
  await connectDB();
  await ensureProjectIndexes();

  const active = await getOrCreateProject(userId);
  if (!withSecrets) return active;

  return (await Project.findById(active._id).select(
    "+gscRefreshToken +gscAccessToken +gscTokenExpiry",
  )) ?? active;
}

export async function updateProjectDomain(
  userId: string,
  domainInput: string,
  name?: string,
) {
  await connectDB();
  const domain = normalizeDomain(domainInput);
  if (!domain || !domain.includes(".")) {
    throw new Error("Enter a valid domain (e.g. skillstack.com.pk)");
  }

  const project = await getOrCreateProject(userId);
  project.domain = domain;
  if (name?.trim()) {
    project.name = name.trim();
  } else if (project.name === "My Site" || !project.name) {
    project.name = formatDomainToProjectName(domain);
  }
  await project.save();
  return toProjectDto(project);
}

export async function updateProjectSettings(
  userId: string,
  settings: {
    domain?: string;
    name?: string;
    locationCode?: number;
    languageCode?: string;
    mcpConnected?: boolean;
    gscSiteUrl?: string | null;
  },
) {
  await connectDB();
  const project = await getOrCreateProject(userId);

  if (settings.domain !== undefined) {
    const domain = normalizeDomain(settings.domain);
    if (!domain || !domain.includes(".")) {
      throw new Error("Enter a valid domain (e.g. skillstack.com.pk)");
    }
    project.domain = domain;
  }

  if (settings.name?.trim()) project.name = settings.name.trim();
  if (settings.locationCode !== undefined) {
    project.locationCode = settings.locationCode;
  }
  if (settings.languageCode !== undefined) {
    project.languageCode = settings.languageCode;
  }
  if (settings.mcpConnected !== undefined) {
    project.mcpConnected = settings.mcpConnected;
  }
  if (settings.gscSiteUrl !== undefined) {
    project.gscSiteUrl = settings.gscSiteUrl;
  }

  await project.save();
  return toProjectDto(project);
}

export async function saveGscConnection(
  userId: string,
  data: {
    refreshToken: string;
    accessToken: string;
    expiresAt: Date;
    siteUrl: string;
  },
) {
  await connectDB();
  const project = await getOrCreateProject(userId);
  project.gscRefreshToken = data.refreshToken;
  project.gscAccessToken = data.accessToken;
  project.gscTokenExpiry = data.expiresAt;
  project.gscSiteUrl = data.siteUrl;
  project.gscPendingSites = null;
  project.gscConnected = true;
  await project.save();
  return toProjectDto(project);
}

export async function saveGscPendingConnection(
  userId: string,
  data: {
    refreshToken: string;
    accessToken: string;
    expiresAt: Date;
    siteOptions: string[];
  },
) {
  await connectDB();
  const project = await getOrCreateProject(userId);
  project.gscRefreshToken = data.refreshToken;
  project.gscAccessToken = data.accessToken;
  project.gscTokenExpiry = data.expiresAt;
  project.gscPendingSites = data.siteOptions;
  project.gscSiteUrl = null;
  project.gscConnected = false;
  await project.save();
}

export async function finalizeGscSite(userId: string, siteUrl: string) {
  await connectDB();
  const project = await getProjectDocument(userId, true);
  const pending = project.gscPendingSites ?? [];
  if (!pending.includes(siteUrl)) {
    throw new Error("That Search Console property is not available for selection.");
  }
  if (!project.gscRefreshToken) {
    throw new Error("Search Console authorization expired. Connect again.");
  }

  project.gscSiteUrl = siteUrl;
  project.gscPendingSites = null;
  project.gscConnected = true;
  await project.save();
  return toProjectDto(project);
}

export async function getGscPendingSites(userId: string) {
  await connectDB();
  const project = await getProjectDocument(userId, true);
  return project.gscPendingSites ?? [];
}

export async function disconnectGsc(userId: string) {
  await connectDB();
  const project = await getOrCreateProject(userId);
  project.gscRefreshToken = null;
  project.gscAccessToken = null;
  project.gscTokenExpiry = null;
  project.gscSiteUrl = null;
  project.gscPendingSites = null;
  project.gscConnected = false;
  await project.save();
  return toProjectDto(project);
}

export async function getProjectForUser(userId: string) {
  await connectDB();
  const project = await getOrCreateProject(userId);
  return toProjectDto(project);
}

export async function updateGscTokens(
  projectId: mongoose.Types.ObjectId,
  tokens: { accessToken: string; refreshToken: string; expiresAt: Date },
) {
  await connectDB();
  await Project.updateOne(
    { _id: projectId },
    {
      gscAccessToken: tokens.accessToken,
      gscRefreshToken: tokens.refreshToken,
      gscTokenExpiry: tokens.expiresAt,
    },
  );
}
