import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getPlan } from "@/lib/pricing";
import { createLemonSqueezyCheckout, lemonSqueezyConfigured } from "@/lib/payments/lemonsqueezy";
import { createPayfastHostedCheckout, payfastConfigured } from "@/lib/payments/payfast";
import { getStripe } from "@/lib/stripe";

type Provider = "lemonsqueezy" | "payfast" | "stripe";

function siteBaseUrl() {
  return (
    process.env.AUTH_URL ||
    process.env.NEXTAUTH_URL ||
    "http://localhost:3000"
  );
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const planId = typeof body.planId === "string" ? body.planId : "";
    const provider = (typeof body.provider === "string"
      ? body.provider
      : "lemonsqueezy") as Provider;
    const mobile = typeof body.mobile === "string" ? body.mobile.trim() : "";

    const plan = getPlan(planId);
    if (!plan) {
      return NextResponse.json({ error: "Invalid plan." }, { status: 400 });
    }

    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Sign in required to purchase a package." },
        { status: 401 },
      );
    }

    const baseUrl = siteBaseUrl();
    const email = session.user.email;
    const name = session.user.name;
    const userId = session.user.id || "";

    if (provider === "lemonsqueezy") {
      if (!lemonSqueezyConfigured()) {
        return NextResponse.json(
          {
            error:
              "International card checkout is not configured yet. Add Lemon Squeezy keys, or contact us.",
          },
          { status: 503 },
        );
      }
      const checkout = await createLemonSqueezyCheckout({
        planId: plan.id,
        email,
        name,
        userId,
        baseUrl,
      });
      return NextResponse.json({ provider, url: checkout.url });
    }

    if (provider === "payfast") {
      if (!payfastConfigured()) {
        return NextResponse.json(
          {
            error:
              "Pakistan checkout is not configured yet. Add PayFast keys, or contact us.",
          },
          { status: 503 },
        );
      }
      if (!mobile || mobile.replace(/\D/g, "").length < 10) {
        return NextResponse.json(
          { error: "Enter a valid Pakistan mobile number for JazzCash / Easypaisa." },
          { status: 400 },
        );
      }
      const hosted = await createPayfastHostedCheckout({
        planId: plan.id,
        email,
        mobile,
        userId,
        baseUrl,
      });
      return NextResponse.json({
        provider,
        action: hosted.action,
        fields: hosted.fields,
        orderId: hosted.orderId,
        amountPkr: hosted.amountPkr,
      });
    }

    if (provider === "stripe") {
      if (!process.env.STRIPE_SECRET_KEY) {
        return NextResponse.json(
          { error: "Stripe is not configured." },
          { status: 503 },
        );
      }
      const stripe = getStripe();
      const checkout = await stripe.checkout.sessions.create({
        mode: "payment",
        payment_method_types: ["card"],
        customer_email: email,
        line_items: [
          {
            quantity: 1,
            price_data: {
              currency: "usd",
              unit_amount: plan.priceUsd * 100,
              product_data: {
                name: `SkillStack · ${plan.name}`,
                description: plan.tagline,
              },
            },
          },
        ],
        metadata: {
          planId: plan.id,
          planName: plan.name,
          userId,
        },
        success_url: `${baseUrl}/pricing/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/pricing/cancel`,
      });
      if (!checkout.url) {
        return NextResponse.json(
          { error: "Could not create Checkout session." },
          { status: 500 },
        );
      }
      return NextResponse.json({ provider, url: checkout.url });
    }

    return NextResponse.json({ error: "Unknown payment provider." }, { status: 400 });
  } catch (error) {
    console.error("Checkout error:", error);
    const message =
      error instanceof Error
        ? error.message
        : "Payment could not be started. Try again or contact us.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
