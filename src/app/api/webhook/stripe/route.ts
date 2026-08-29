import { NextResponse } from "next/server";
import { headers } from "next/headers";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";

export async function POST(req: Request) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event: Stripe.Event;

  try {
    if (webhookSecret && signature) {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } else {
      event = JSON.parse(body) as Stripe.Event;
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Webhook signature verification failed";
    console.error(`[Stripe Webhook Error]: ${message}`);
    return NextResponse.json({ error: message }, { status: 400 });
  }

  // Handle successful checkout
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.userId || session.client_reference_id;
    const userEmail = session.customer_email || session.metadata?.userEmail;

    try {
      await connectDB();
      if (userId) {
        await User.findByIdAndUpdate(userId, { dashboardPro: true });
      } else if (userEmail) {
        await User.findOneAndUpdate(
          { email: userEmail.toLowerCase().trim() },
          { dashboardPro: true },
        );
      }
    } catch (dbErr) {
      console.error("[Stripe Webhook DB Update Error]:", dbErr);
      return NextResponse.json(
        { error: "Failed to update user status in database." },
        { status: 500 },
      );
    }
  }

  return NextResponse.json({ received: true });
}
