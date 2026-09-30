import { connectDB } from "@/lib/db";
import { User } from "@/models/User";

/** One free Include-backlinks run per profile; Pro is unlimited. */
export const CONTENT_GAP_BACKLINKS_FREE_LIMIT = 1;

export type ContentGapBacklinksEntitlement = {
  used: number;
  limit: number;
  remaining: number;
  unlimited: boolean;
  available: boolean;
};

export class ContentGapBacklinksLimitError extends Error {
  readonly code = "BACKLINKS_LIMIT_EXCEEDED";
  readonly upgradeUrl = "/pricing";
  readonly entitlement: ContentGapBacklinksEntitlement;

  constructor(entitlement: ContentGapBacklinksEntitlement) {
    super(
      "You've already used your one free Include backlinks run on this account. Upgrade to unlock unlimited backlink comparisons.",
    );
    this.name = "ContentGapBacklinksLimitError";
    this.entitlement = entitlement;
  }
}

function buildEntitlement(
  used: number,
  unlimited: boolean,
): ContentGapBacklinksEntitlement {
  if (unlimited) {
    return {
      used,
      limit: CONTENT_GAP_BACKLINKS_FREE_LIMIT,
      remaining: CONTENT_GAP_BACKLINKS_FREE_LIMIT,
      unlimited: true,
      available: true,
    };
  }
  const remaining = Math.max(0, CONTENT_GAP_BACKLINKS_FREE_LIMIT - used);
  return {
    used,
    limit: CONTENT_GAP_BACKLINKS_FREE_LIMIT,
    remaining,
    unlimited: false,
    available: remaining > 0,
  };
}

export async function getContentGapBacklinksEntitlement(
  userId: string,
): Promise<ContentGapBacklinksEntitlement> {
  await connectDB();
  const user = await User.findById(userId).select(
    "dashboardPro contentGapBacklinksUsageCount",
  );
  if (!user) throw new Error("User not found.");
  return buildEntitlement(
    user.contentGapBacklinksUsageCount ?? 0,
    Boolean(user.dashboardPro),
  );
}

export async function assertContentGapBacklinksAvailable(userId: string) {
  const entitlement = await getContentGapBacklinksEntitlement(userId);
  if (!entitlement.available) {
    throw new ContentGapBacklinksLimitError(entitlement);
  }
  return entitlement;
}

/** Consume one free use after a successful includeLinks report (no-op for Pro). */
export async function consumeContentGapBacklinksOnce(
  userId: string,
): Promise<ContentGapBacklinksEntitlement> {
  await connectDB();
  const user = await User.findById(userId).select(
    "dashboardPro contentGapBacklinksUsageCount",
  );
  if (!user) throw new Error("User not found.");

  if (user.dashboardPro) {
    return buildEntitlement(user.contentGapBacklinksUsageCount ?? 0, true);
  }

  const updated = await User.findOneAndUpdate(
    {
      _id: userId,
      contentGapBacklinksUsageCount: { $lt: CONTENT_GAP_BACKLINKS_FREE_LIMIT },
    },
    { $inc: { contentGapBacklinksUsageCount: 1 } },
    { new: true },
  ).select("dashboardPro contentGapBacklinksUsageCount");

  if (!updated) {
    const entitlement = await getContentGapBacklinksEntitlement(userId);
    throw new ContentGapBacklinksLimitError(entitlement);
  }

  return buildEntitlement(
    updated.contentGapBacklinksUsageCount ?? 0,
    Boolean(updated.dashboardPro),
  );
}

export function contentGapBacklinksLimitJson(error: ContentGapBacklinksLimitError) {
  return {
    message: error.message,
    code: error.code,
    upgradeUrl: error.upgradeUrl,
    entitlement: error.entitlement,
  };
}
