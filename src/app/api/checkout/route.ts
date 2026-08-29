import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getPlan } from "@/lib/pricing";
import { getStripe } from "@/lib/stripe";

function siteBaseUrl() {
  return (
    process.env.AUTH_URL ||
    process.env.NEXTAUTH_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")
  );
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const planId = typeof body.planId === "string" ? body.planId : "pro";

    const plan = getPlan(planId);
    if (!plan) {
      return NextResponse.json({ error: "Invalid plan selected." }, { status: 400 });
    }

    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Please sign in or register before checking out." },
        { status: 401 },
      );
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        {
          error:
            "SkillStack is currently in testing mode — all dashboard features are 100% free to use for now! Stripe checkout will be live soon.",
        },
        { status: 503 },
      );
    }

    const stripe = getStripe();
    const baseUrl = siteBaseUrl();
    const email = session.user.email;
    const userId = session.user.id || "";

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: email,
      client_reference_id: userId || undefined,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: Math.round(plan.priceUsd * 100),
            product_data: {
              name: `SkillStack · ${plan.name}`,
              description: plan.tagline,
              images: [`${baseUrl}/opengraph-image.png`],
            },
          },
        },
      ],
      metadata: {
        userId,
        planId: plan.id,
        planName: plan.name,
        userEmail: email,
      },
      allow_promotion_codes: true,
      billing_address_collection: "auto",
      success_url: `${baseUrl}/pricing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/pricing/cancel`,
    });

    if (!checkoutSession.url) {
      return NextResponse.json(
        { error: "Could not create Stripe checkout session." },
        { status: 500 },
      );
    }

    return NextResponse.json({ url: checkoutSession.url });
  } catch (err) {
    console.error("[Checkout Route Error]:", err);
    const message =
      err instanceof Error ? err.message : "Failed to initialize Stripe checkout.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
