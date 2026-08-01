import { createHmac, timingSafeEqual } from "crypto";
import type { PlanId } from "@/lib/pricing";
import { getPlan } from "@/lib/pricing";

function requireEnv(name: string) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is not set`);
  return value;
}

export function lemonSqueezyConfigured() {
  return Boolean(
    process.env.LEMONSQUEEZY_API_KEY &&
      process.env.LEMONSQUEEZY_STORE_ID &&
      process.env.LEMONSQUEEZY_VARIANT_KEYWORDS &&
      process.env.LEMONSQUEEZY_VARIANT_GROWTH &&
      process.env.LEMONSQUEEZY_VARIANT_FULLSTACK,
  );
}

function variantIdForPlan(planId: PlanId) {
  const map: Record<PlanId, string | undefined> = {
    keywords: process.env.LEMONSQUEEZY_VARIANT_KEYWORDS,
    growth: process.env.LEMONSQUEEZY_VARIANT_GROWTH,
    fullstack: process.env.LEMONSQUEEZY_VARIANT_FULLSTACK,
  };
  const id = map[planId]?.trim();
  if (!id) throw new Error(`Lemon Squeezy variant missing for plan ${planId}`);
  return id;
}

export async function createLemonSqueezyCheckout(options: {
  planId: PlanId;
  email: string;
  name?: string | null;
  userId?: string;
  baseUrl: string;
}) {
  const plan = getPlan(options.planId);
  if (!plan) throw new Error("Invalid plan");

  const apiKey = requireEnv("LEMONSQUEEZY_API_KEY");
  const storeId = requireEnv("LEMONSQUEEZY_STORE_ID");
  const variantId = variantIdForPlan(options.planId);

  const res = await fetch("https://api.lemonsqueezy.com/v1/checkouts", {
    method: "POST",
    headers: {
      Accept: "application/vnd.api+json",
      "Content-Type": "application/vnd.api+json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      data: {
        type: "checkouts",
        attributes: {
          product_options: {
            name: `SkillStack · ${plan.name}`,
            description: plan.tagline,
            redirect_url: `${options.baseUrl}/pricing/success`,
            enabled_variants: [Number(variantId)],
          },
          checkout_options: {
            embed: false,
            button_color: "#2dd4bf",
          },
          checkout_data: {
            email: options.email,
            name: options.name || undefined,
            custom: {
              plan_id: options.planId,
              user_id: options.userId || "",
            },
          },
        },
        relationships: {
          store: {
            data: { type: "stores", id: storeId },
          },
          variant: {
            data: { type: "variants", id: variantId },
          },
        },
      },
    }),
  });

  const json = (await res.json()) as {
    data?: { attributes?: { url?: string } };
    errors?: { detail?: string }[];
  };

  if (!res.ok || !json.data?.attributes?.url) {
    const detail = json.errors?.[0]?.detail || "Lemon Squeezy checkout failed";
    throw new Error(detail);
  }

  return { url: json.data.attributes.url };
}

/** Verify Lemon Squeezy webhook signature (X-Signature). */
export function verifyLemonSqueezySignature(
  rawBody: string,
  signatureHeader: string | null,
) {
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET?.trim();
  if (!secret || !signatureHeader) return false;

  const digest = createHmac("sha256", secret).update(rawBody).digest("hex");
  try {
    return timingSafeEqual(
      Buffer.from(digest, "utf8"),
      Buffer.from(signatureHeader, "utf8"),
    );
  } catch {
    return false;
  }
}
