import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth-session";
import { connectDB } from "@/lib/db";
import { User, toPublicProfile } from "@/models/User";

const MAX_DATA_URL_CHARS = 450_000; // ~330KB binary after base64
const ALLOWED = /^data:image\/(jpeg|jpg|png|webp);base64,/i;

export async function POST(request: Request) {
  const result = await requireUser();
  if ("response" in result) return result.response;
  const { user: sessionUser } = result;

  try {
    const body = await request.json();
    await connectDB();
    const user = await User.findById(sessionUser.id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (body.image === null || body.image === "") {
      await User.updateOne({ _id: user._id }, { $unset: { image: "" } });
      const fresh = await User.findById(user._id);
      return NextResponse.json({
        profile: toPublicProfile(fresh!),
        email: fresh!.email,
      });
    }

    if (typeof body.image !== "string" || !ALLOWED.test(body.image)) {
      return NextResponse.json(
        { error: "Upload a JPEG, PNG, or WebP image." },
        { status: 400 },
      );
    }

    if (body.image.length > MAX_DATA_URL_CHARS) {
      return NextResponse.json(
        { error: "Image is too large. Try a smaller photo (under ~300KB)." },
        { status: 400 },
      );
    }

    user.image = body.image;
    await user.save();

    return NextResponse.json({
      profile: toPublicProfile(user),
      email: user.email,
    });
  } catch (error) {
    console.error("[profile avatar]", error);
    return NextResponse.json(
      { error: "Could not update photo. Try again." },
      { status: 500 },
    );
  }
}
