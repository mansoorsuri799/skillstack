import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth-session";
import { connectDB } from "@/lib/db";
import { expertReply, getExpertById, teamExperts } from "@/lib/team";
import { Conversation } from "@/models/Conversation";
import { Message } from "@/models/Message";

export async function GET() {
  const result = await requireUser();
  if ("response" in result) return result.response;

  await connectDB();
  const rows = await Conversation.find({ userId: result.user.id })
    .sort({ lastAt: -1 })
    .lean();

  const conversations = rows.map((row) => {
    const expert = getExpertById(row.expertId);
    return {
      expertId: row.expertId,
      lastMessage: row.lastMessage,
      lastAt: row.lastAt,
      expert: expert
        ? {
            id: expert.id,
            name: expert.name,
            role: expert.role,
            initials: expert.initials,
            tone: expert.tone,
            status: expert.status,
          }
        : null,
    };
  });

  return NextResponse.json({ conversations, team: teamExperts });
}

export async function POST(req: Request) {
  const result = await requireUser();
  if ("response" in result) return result.response;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const expertId =
    typeof body === "object" && body && "expertId" in body
      ? String((body as { expertId: unknown }).expertId)
      : "";
  const text =
    typeof body === "object" && body && "body" in body
      ? String((body as { body: unknown }).body).trim()
      : "";

  const expert = getExpertById(expertId);
  if (!expert) {
    return NextResponse.json({ error: "Unknown specialist" }, { status: 404 });
  }
  if (!text || text.length > 4000) {
    return NextResponse.json({ error: "Message must be 1–4000 characters." }, { status: 400 });
  }

  await connectDB();

  let convo = await Conversation.findOne({
    userId: result.user.id,
    expertId: expert.id,
  });

  if (!convo) {
    convo = await Conversation.create({
      userId: result.user.id,
      expertId: expert.id,
      lastMessage: text,
      lastAt: new Date(),
    });
  }

  const userMsg = await Message.create({
    conversationId: convo._id,
    sender: "user",
    body: text,
  });

  const replyText = expertReply(expert, text);
  const expertMsg = await Message.create({
    conversationId: convo._id,
    sender: "expert",
    body: replyText,
  });

  convo.lastMessage = replyText;
  convo.lastAt = new Date();
  await convo.save();

  return NextResponse.json({
    messages: [
      {
        id: userMsg._id.toString(),
        sender: userMsg.sender,
        body: userMsg.body,
        createdAt: userMsg.createdAt,
      },
      {
        id: expertMsg._id.toString(),
        sender: expertMsg.sender,
        body: expertMsg.body,
        createdAt: expertMsg.createdAt,
      },
    ],
  });
}
