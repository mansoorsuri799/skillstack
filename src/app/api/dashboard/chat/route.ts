import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth-session";
import { connectDB } from "@/lib/db";
import { getProjectDocument, getProjectForUser } from "@/lib/dashboard/project";
import { ProjectChat } from "@/models/ProjectChat";
import { runSuriAgentReply, streamSuriAgentReply } from "@/lib/chat/suri-agent";
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
  stream: boolean;
}> {
  const contentType = request.headers.get("content-type") || "";
  const wantStream =
    request.headers.get("accept")?.includes("text/event-stream") ||
    new URL(request.url).searchParams.get("stream") === "1";

  if (contentType.includes("multipart/form-data")) {
    const form = await request.formData();
    const prompt = String(form.get("message") ?? "").trim();
    const chatIdRaw = form.get("chatId");
    const chatId = chatIdRaw ? String(chatIdRaw).trim() : null;
    const stream =
      wantStream || String(form.get("stream") ?? "") === "1";
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

    return { prompt, chatId, files, stream };
  }

  const body = (await request.json()) as {
    message?: unknown;
    chatId?: unknown;
    stream?: unknown;
  };
  return {
    prompt: String(body.message ?? "").trim(),
    chatId: body.chatId ? String(body.chatId).trim() : null,
    files: [],
    stream: wantStream || Boolean(body.stream),
  };
}

function sseEncode(event: string, data: unknown) {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
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

    const { prompt: rawPrompt, chatId, files, stream } = await readChatRequest(request);
    const fileError = validateChatFiles(files);
    if (fileError) {
      return NextResponse.json({ message: fileError }, { status: 400 });
    }

    const prompt = rawPrompt || (files.length ? DEFAULT_FILE_ANALYSIS_PROMPT : "");
    if (!prompt) {
      return NextResponse.json(
        { message: "Enter a message or attach a file." },
        { status: 400 },
      );
    }

    let chat;
    if (chatId) {
      chat = await ProjectChat.findOne({
        _id: chatId,
        userId: user.id,
        projectId: project.id,
      });
    }

    if (!chat) {
      const titleSource = rawPrompt || files[0]?.name || prompt;
      const title =
        titleSource.length > 35 ? `${titleSource.slice(0, 32)}...` : titleSource;
      chat = new ProjectChat({
        userId: user.id,
        projectId: project.id,
        title,
        messages: [],
      });
    }

    const history = chat.messages.map(
      (m: { role: "user" | "assistant"; content: string }) => ({
        role: m.role,
        content: m.content,
      }),
    );

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

    const suriContext = {
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
    };

    if (!stream) {
      const suriReply = await runSuriAgentReply(agentPrompt, history, suriContext);
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
    }

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        const send = (event: string, data: unknown) => {
          controller.enqueue(encoder.encode(sseEncode(event, data)));
        };

        try {
          // Persist user turn early so refresh mid-stream keeps the question
          await chat.save();
          send("meta", {
            chatId: chat._id.toString(),
            title: chat.title,
          });

          let finalReply: { answer: string; sources: Array<{ title: string; url: string }> } | null =
            null;

          for await (const event of streamSuriAgentReply(
            agentPrompt,
            history,
            suriContext,
          )) {
            if (event.type === "token") {
              send("token", { text: event.text });
            } else {
              finalReply = event.reply;
            }
          }

          if (!finalReply) {
            throw new Error("Suri returned an empty reply.");
          }

          chat.messages.push({
            role: "assistant",
            content: finalReply.answer,
            sources: finalReply.sources,
            createdAt: new Date(),
          });
          await chat.save();

          send("done", {
            chat: serializeChat(chat),
            reply: finalReply,
          });
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Chat failed";
          send("error", { message });
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Chat failed";
    return NextResponse.json({ message }, { status: 500 });
  }
}

export const runtime = "nodejs";
export const maxDuration = 60;
