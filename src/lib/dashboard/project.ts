import mongoose, { type HydratedDocument } from "mongoose";
import { connectDB } from "@/lib/db";
import { normalizeDomain } from "@/lib/dataforseo/client";
import { Project, toProjectDto, type ProjectDocument } from "@/models/Project";

type ProjectModel = HydratedDocument<ProjectDocument>;

export async function getOrCreateProject(userId: string): Promise<ProjectModel> {
  await connectDB();
  let project = await Project.findOne({ userId });
  if (project) return project;

  project = await Project.create({
    userId,
    name: "My Site",
    domain: "example.com",
  });
  return project;
}

export async function getProjectDocument(userId: string, withSecrets = false) {
  await connectDB();
  let query = Project.findOne({ userId });
  if (withSecrets) {
    query = query.select("+gscRefreshToken +gscAccessToken +gscTokenExpiry");
  }
  let project = await query;
  if (!project) {
    project = await Project.create({
      userId,
      name: "My Site",
      domain: "example.com",
    });
  }
  return project;
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
  if (name?.trim()) project.name = name.trim();
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
