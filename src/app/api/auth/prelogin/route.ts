import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email =
      typeof body.email === "string" ? body.email.toLowerCase().trim() : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!email || !password) {
      return NextResponse.json(
        { error: "INVALID", message: "Enter email and password." },
        { status: 400 },
      );
    }

    await connectDB();
    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json(
        { error: "INVALID", message: "Invalid email or password." },
        { status: 401 },
      );
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return NextResponse.json(
        { error: "INVALID", message: "Invalid email or password." },
        { status: 401 },
      );
    }

    if (!user.emailVerified) {
      return NextResponse.json(
        {
          error: "EMAIL_NOT_VERIFIED",
          message:
            "Verify your email before signing in. Open the link we sent you.",
        },
        { status: 403 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Prelogin error:", error);
    return NextResponse.json(
      { error: "SERVER", message: "Something went wrong. Try again." },
      { status: 500 },
    );
  }
}
