import { connectDB } from "@/lib/db";
import { User } from "@/models/User";

export const FREE_AI_TOOL_LIMIT = 3;

export type AiToolFeature = "brandLookup" | "promptExplorer";

const USAGE_FIELDS: Record<AiToolFeature, "brandLookupUsageCount" | "promptExplorerUsageCount"> =
  {
    brandLookup: "brandLookupUsageCount",
    promptExplorer: "promptExplorerUsageCount",
  };

export type AiToolUsage = {
  feature: AiToolFeature;
  used: number;
  limit: number;
  remaining: number;
  unlimited: boolean;
};

export class AiToolLimitError extends Error {
  readonly code = "USAGE_LIMIT_EXCEEDED";
  readonly upgradeUrl = "/pricing";
  readonly usage: AiToolUsage;

  constructor(feature: AiToolFeature, usage: AiToolUsage) {
    const label = feature === "brandLookup" ? "Brand Lookup" : "Prompt Explorer";
    super(
      `You've used all ${FREE_AI_TOOL_LIMIT} free ${label} searches. Upgrade your plan to continue.`,
    );
    this.name = "AiToolLimitError";
    this.usage = usage;
  }
}

function buildUsage(
  feature: AiToolFeature,
  used: number,
  unlimited: boolean,
): AiToolUsage {
  if (unlimited) {
    return {
      feature,
      used,
      limit: FREE_AI_TOOL_LIMIT,
      remaining: FREE_AI_TOOL_LIMIT,
      unlimited: true,
    };
  }

  const remaining = Math.max(0, FREE_AI_TOOL_LIMIT - used);
  return {
    feature,
    used,
    limit: FREE_AI_TOOL_LIMIT,
    remaining,
    unlimited: false,
  };
}

export async function getAiToolUsage(
  userId: string,
  feature: AiToolFeature,
): Promise<AiToolUsage> {
  await connectDB();
  const user = await User.findById(userId).select(
    "dashboardPro brandLookupUsageCount promptExplorerUsageCount",
  );
  if (!user) {
    throw new Error("User not found.");
  }

  const field = USAGE_FIELDS[feature];
  const used = user[field] ?? 0;
  return buildUsage(feature, used, Boolean(user.dashboardPro));
}

export async function getAllAiToolUsage(userId: string): Promise<{
  brandLookup: AiToolUsage;
  promptExplorer: AiToolUsage;
}> {
  const [brandLookup, promptExplorer] = await Promise.all([
    getAiToolUsage(userId, "brandLookup"),
    getAiToolUsage(userId, "promptExplorer"),
  ]);
  return { brandLookup, promptExplorer };
}

export async function assertAiToolAvailable(
  userId: string,
  feature: AiToolFeature,
): Promise<AiToolUsage> {
  const usage = await getAiToolUsage(userId, feature);
  if (!usage.unlimited && usage.used >= FREE_AI_TOOL_LIMIT) {
    throw new AiToolLimitError(feature, usage);
  }
  return usage;
}

export async function incrementAiToolUsage(
  userId: string,
  feature: AiToolFeature,
): Promise<AiToolUsage> {
  await connectDB();
  const field = USAGE_FIELDS[feature];
  const user = await User.findByIdAndUpdate(
    userId,
    { $inc: { [field]: 1 } },
    { new: true },
  ).select("dashboardPro brandLookupUsageCount promptExplorerUsageCount");

  if (!user) {
    throw new Error("User not found.");
  }

  return buildUsage(feature, user[field] ?? 0, Boolean(user.dashboardPro));
}

export function aiToolLimitJson(error: AiToolLimitError) {
  return {
    message: error.message,
    code: error.code,
    upgradeUrl: error.upgradeUrl,
    usage: error.usage,
  };
}

/** Call after a successful plan purchase to remove usage caps. */
export async function grantDashboardPro(userId: string) {
  await connectDB();
  await User.findByIdAndUpdate(userId, { dashboardPro: true });
}
