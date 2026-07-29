import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { sendContactInquiry } from "@/lib/mail";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json(
      { error: "Sign in required to send a brief." },
      { status: 401 },
    );
  }

  try {
    const body = await request.json();
    const name =
      typeof body.name === "string" ? body.name.trim() : session.user.name || "";
    const email = session.user.email.toLowerCase().trim();
    const topic = typeof body.topic === "string" ? body.topic.trim() : "";
    const message = typeof body.message === "string" ? body.message.trim() : "";

    if (!name || name.length < 2) {
      return NextResponse.json({ error: "Please enter your name." }, { status: 400 });
    }
    if (!topic) {
      return NextResponse.json({ error: "Please choose a topic." }, { status: 400 });
    }
    if (!message || message.length < 10) {
      return NextResponse.json(
        { error: "Please write a bit more about your project." },
        { status: 400 },
      );
    }
    if (message.length > 5000) {
      return NextResponse.json({ error: "Message is too long." }, { status: 400 });
    }

    await sendContactInquiry({
      name,
      email,
      topic,
      message,
      userId: session.user.id,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[contact]", error);
    return NextResponse.json(
      {
        error:
          "Could not send your message. Check SMTP settings or try again later.",
      },
      { status: 500 },
    );
  }
}
