import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import { User, toPublicProfile } from "@/models/User";

const USERNAME_RE = /^[a-z0-9][a-z0-9_-]{1,30}[a-z0-9]$/;

function normalizeSkills(input: unknown): string[] {
  if (!Array.isArray(input)) return [];
  const cleaned = input
    .map((s) => (typeof s === "string" ? s.trim() : ""))
    .filter(Boolean)
    .slice(0, 24)
    .map((s) => s.slice(0, 40));
  return [...new Set(cleaned)];
}

function cleanUrl(value: unknown, max = 200): string {
  if (typeof value !== "string") return "";
  const v = value.trim().slice(0, max);
  if (!v) return "";
  if (/^https?:\/\//i.test(v)) return v;
  return `https://${v}`;
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const user = await User.findById(session.user.id);
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({
    profile: toPublicProfile(user),
    email: user.email,
  });
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    await connectDB();
    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (typeof body.name === "string") {
      const name = body.name.trim();
      if (name.length < 2) {
        return NextResponse.json(
          { error: "Name must be at least 2 characters." },
          { status: 400 },
        );
      }
      user.name = name.slice(0, 80);
    }

    let clearUsername = false;
    if (typeof body.username === "string") {
      const username = body.username.trim().toLowerCase();
      if (!username) {
        clearUsername = true;
      } else {
        if (!USERNAME_RE.test(username)) {
          return NextResponse.json(
            {
              error:
                "Username must be 3–32 chars: letters, numbers, _ or - (no spaces).",
            },
            { status: 400 },
          );
        }
        const taken = await User.findOne({
          username,
          _id: { $ne: user._id },
        });
        if (taken) {
          return NextResponse.json(
            { error: "That username is already taken." },
            { status: 409 },
          );
        }
        user.username = username;
      }
    }

    if (typeof body.headline === "string") {
      user.headline = body.headline.trim().slice(0, 120);
    }
    if (typeof body.bio === "string") {
      user.bio = body.bio.trim().slice(0, 2000);
    }
    if (body.skills !== undefined) {
      user.skills = normalizeSkills(body.skills);
    }
    if (typeof body.location === "string") {
      user.location = body.location.trim().slice(0, 80);
    }
    if (typeof body.company === "string") {
      user.company = body.company.trim().slice(0, 100);
    }
    if (body.website !== undefined) {
      user.website = cleanUrl(body.website);
    }
    if (body.linkedin !== undefined) {
      user.linkedin = cleanUrl(body.linkedin);
    }
    if (body.xProfile !== undefined) {
      user.xProfile = cleanUrl(body.xProfile);
    }
    if (typeof body.availableForWork === "boolean") {
      user.availableForWork = body.availableForWork;
    }

    await user.save();
    if (clearUsername) {
      await User.updateOne({ _id: user._id }, { $unset: { username: "" } });
    }

    const fresh = await User.findById(user._id);
    return NextResponse.json({
      profile: toPublicProfile(fresh!),
      email: fresh!.email,
    });
  } catch (error) {
    console.error("[profile PATCH]", error);
    return NextResponse.json(
      { error: "Could not save profile. Try again." },
      { status: 500 },
    );
  }
}
