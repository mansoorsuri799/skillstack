import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth-session";
import { connectDB } from "@/lib/db";
import { getProjectDocument, getProjectForUser } from "@/lib/dashboard/project";
import { ProjectChat } from "@/models/ProjectChat";
import { runSuriAgentReply } from "@/lib/chat/suri-agent";
import { analyzeChatUploads } from "@/lib/chat/file-analysis";
import {
  DEFAULT_FILE_ANALYSIS_PROMPT,
  validateChatFiles,
} from "@/lib/chat/file-types";
import { serializeChat } from "@/lib/chat/serialize-chat";

type IncomingUpload = {
  name: string;
  mimeType: string;
  size: number;
  buffer: Buffer;
};

async function readChatRequest(request: Request): Promise<{
  prompt: string;
  chatId: string | null;
  files: IncomingUpload[];
}> {
  const contentType = request.headers.get("content-type") || "";
  if (contentType.includes("multipart/form-data")) {
    const form = await request.formData();
    const prompt = String(form.get("message") ?? "").trim();
    const chatIdRaw = form.get("chatId");
    const chatId = chatIdRaw ? String(chatIdRaw).trim() : null;
    const files: IncomingUpload[] = [];

    for (const item of form.getAll("files")) {
      if (typeof item === "string") continue;
      const file = item as File;
      if (!file.size) continue;
      files.push({
        name: file.name || "upload",
        mimeType: file.type || "",
        size: file.size,
        buffer: Buffer.from(await file.arrayBuffer()),
      });
    }

    return { prompt, chatId, files };
  }

  const body = (await request.json()) as { message?: unknown; chatId?: unknown };
  return {
    prompt: String(body.message ?? "").trim(),
    chatId: body.chatId ? String(body.chatId).trim() : null,
    files: [],
  };
}

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

    const { prompt: rawPrompt, chatId, files } = await readChatRequest(request);
    const fileError = validateChatFiles(files);
    if (fileError) {
      return NextResponse.json({ message: fileError }, { status: 400 });
    }

    const prompt = rawPrompt || (files.length ? DEFAULT_FILE_ANALYSIS_PROMPT : "");
    if (!prompt) {
      return NextResponse.json({ message: "Enter a message or attach a file." }, { status: 400 });
    }

    let chat;
    if (chatId) {
      chat = await ProjectChat.findOne({ _id: chatId, userId: user.id, projectId: project.id });
    }

    if (!chat) {
      const titleSource = rawPrompt || files[0]?.name || prompt;
      const title = titleSource.length > 35 ? `${titleSource.slice(0, 32)}...` : titleSource;
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

    const fileAnalysis = files.length ? await analyzeChatUploads(files) : null;
    const attachments = fileAnalysis?.attachments ?? [];

    chat.messages.push({
      role: "user",
      content: prompt,
      attachments,
      fileContext: fileAnalysis?.report || "",
      createdAt: new Date(),
    });

    const agentPrompt = attachments.length
      ? `${prompt}\n\nAttached files: ${attachments.map((a) => a.name).join(", ")}`
      : prompt;

    const suriReply = await runSuriAgentReply(agentPrompt, history, {
      domain: projectDoc.domain,
      projectName: projectDoc.name,
      gscProject: {
        gscConnected: projectDoc.gscConnected,
        gscSiteUrl: projectDoc.gscSiteUrl,
        gscRefreshToken: projectDoc.gscRefreshToken,
        gscAccessToken: projectDoc.gscAccessToken,
        gscTokenExpiry: projectDoc.gscTokenExpiry,
      },
      fileAnalysis,
    });

    chat.messages.push({
      role: "assistant",
      content: suriReply.answer,
      sources: suriReply.sources,
      createdAt: new Date(),
    });

    await chat.save();

    return NextResponse.json({
      chat: serializeChat(chat),
      reply: suriReply,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Chat failed";
    return NextResponse.json({ message }, { status: 500 });
  }
}

export const runtime = "nodejs";
export const maxDuration = 60;
