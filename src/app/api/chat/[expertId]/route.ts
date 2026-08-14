import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth-session";
import { connectDB } from "@/lib/db";
import { getExpertById } from "@/lib/team";
import { Conversation } from "@/models/Conversation";
import { Message } from "@/models/Message";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ expertId: string }> },
) {
  const result = await requireUser();
  if ("response" in result) return result.response;

  const { expertId } = await params;
  const expert = getExpertById(expertId);
  if (!expert) {
    return NextResponse.json({ error: "Unknown specialist" }, { status: 404 });
  }

  await connectDB();
  const convo = await Conversation.findOne({
    userId: result.user.id,
    expertId: expert.id,
  });

  if (!convo) {
    return NextResponse.json({ expert, messages: [] });
  }

  const messages = await Message.find({ conversationId: convo._id })
    .sort({ createdAt: 1 })
    .lean();

  return NextResponse.json({
    expert,
    messages: messages.map((m) => ({
      id: m._id.toString(),
      sender: m.sender,
      body: m.body,
      createdAt: m.createdAt,
    })),
  });
}
