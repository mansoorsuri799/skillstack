import { NextResponse } from "next/server";
import { verifyLemonSqueezySignature } from "@/lib/payments/lemonsqueezy";

/**
 * Lemon Squeezy webhook — configure in LS dashboard:
 * URL: https://skillstack.com.pk/api/webhooks/lemonsqueezy
 * Events: order_created (and optionally subscription_*)
 */
export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("X-Signature");

  if (!verifyLemonSqueezySignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  try {
    const payload = JSON.parse(rawBody) as {
      meta?: { event_name?: string; custom_data?: Record<string, string> };
      data?: { id?: string; attributes?: Record<string, unknown> };
    };

    const event = payload.meta?.event_name || "unknown";
    const custom = payload.meta?.custom_data || {};

    // Log for ops; extend to mark orders paid in MongoDB when you add an Order model.
    console.info("[lemonsqueezy webhook]", {
      event,
      orderId: payload.data?.id,
      planId: custom.plan_id,
      userId: custom.user_id,
    });

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[lemonsqueezy webhook] parse error", error);
    return NextResponse.json({ error: "Bad payload" }, { status: 400 });
  }
}
