import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getPlan } from "@/lib/pricing";
import { getStripe } from "@/lib/stripe";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const planId = typeof body.planId === "string" ? body.planId : "";
    const plan = getPlan(planId);

    if (!plan) {
      return NextResponse.json({ error: "Invalid plan." }, { status: 400 });
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        {
          error:
            "Stripe is not configured yet. Add STRIPE_SECRET_KEY to .env.local.",
        },
        { status: 503 },
      );
    }

    const baseUrl =
      process.env.AUTH_URL ||
      process.env.NEXTAUTH_URL ||
      "http://localhost:3000";

    const session = await auth();
    const stripe = getStripe();

    const checkout = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: session?.user?.email || undefined,
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
        userId: session?.user?.id || "",
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

    return NextResponse.json({ url: checkout.url });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Payment could not be started. Try again or contact us." },
      { status: 500 },
    );
  }
}
