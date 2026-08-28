import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth-session";
import { connectDB } from "@/lib/db";
import { getProjectDocument, getProjectForUser } from "@/lib/dashboard/project";
import { ProjectChat } from "@/models/ProjectChat";
import { runSuriAgentReply } from "@/lib/chat/suri-agent";

export async function GET(request: Request) {
  const result = await requireUser(request);
  if ("response" in result) return result.response;
  const { user } = result;

  try {
    const project = await getProjectForUser(user.id);
    await connectDB();

    const chats = await ProjectChat.find({
      userId: user.id,
      projectId: project.id,
    })
      .sort({ updatedAt: -1 })
      .limit(30)
      .lean();

    return NextResponse.json({
      chats: chats.map((c) => ({
        id: c._id.toString(),
        title: c.title,
        messageCount: c.messages.length,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
      })),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load chats";
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const result = await requireUser(request);
  if ("response" in result) return result.response;
  const { user } = result;

  try {
    const project = await getProjectForUser(user.id);
    const projectDoc = await getProjectDocument(user.id, true);
    await connectDB();

    const body = await request.json();
    const prompt = String(body.message ?? "").trim();
    const chatId = body.chatId ? String(body.chatId).trim() : null;

    if (!prompt) {
      return NextResponse.json({ message: "Enter a message." }, { status: 400 });
    }

    let chat;
    if (chatId) {
      chat = await ProjectChat.findOne({ _id: chatId, userId: user.id, projectId: project.id });
    }

    if (!chat) {
      // Create new chat session with first user message as title snippet
      const title = prompt.length > 35 ? `${prompt.slice(0, 32)}...` : prompt;
      chat = new ProjectChat({
        userId: user.id,
        projectId: project.id,
        title,
        messages: [],
      });
    }

    const history = chat.messages.map((m: { role: "user" | "assistant"; content: string }) => ({
      role: m.role,
      content: m.content,
    }));

    // Append user message
    chat.messages.push({
      role: "user",
      content: prompt,
      createdAt: new Date(),
    });

    // Run Suri Agent reasoning
    const suriReply = await runSuriAgentReply(prompt, history, {
      domain: projectDoc.domain,
      projectName: projectDoc.name,
      gscProject: {
        gscConnected: projectDoc.gscConnected,
        gscSiteUrl: projectDoc.gscSiteUrl,
        gscRefreshToken: projectDoc.gscRefreshToken,
        gscAccessToken: projectDoc.gscAccessToken,
        gscTokenExpiry: projectDoc.gscTokenExpiry,
      },
    });

    // Append assistant response
    chat.messages.push({
      role: "assistant",
      content: suriReply.answer,
      sources: suriReply.sources,
      createdAt: new Date(),
    });

    await chat.save();

    return NextResponse.json({
      chat: {
        id: chat._id.toString(),
        title: chat.title,
        messages: chat.messages,
        createdAt: chat.createdAt,
        updatedAt: chat.updatedAt,
      },
      reply: suriReply,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Chat failed";
    return NextResponse.json({ message }, { status: 500 });
  }
}

export const maxDuration = 60;
