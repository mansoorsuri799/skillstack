import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User, toPublicProfile } from "@/models/User";

type Params = { params: Promise<{ username: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { username } = await params;
  const slug = username.trim().toLowerCase();
  if (!slug) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await connectDB();
  const user = await User.findOne({ username: slug });
  if (!user) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  return NextResponse.json({ profile: toPublicProfile(user) });
}
