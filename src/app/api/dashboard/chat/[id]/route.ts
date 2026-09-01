import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth-session";
import { connectDB } from "@/lib/db";
import { getProjectDocument, getProjectForUser } from "@/lib/dashboard/project";
import { ProjectChat } from "@/models/ProjectChat";
import { runSuriAgentReply } from "@/lib/chat/suri-agent";
import { serializeChat } from "@/lib/chat/serialize-chat";

export async function GET(
  request: Request,
  props: { params: Promise<{ id: string }> },
) {
  const params = await props.params;
  const result = await requireUser(request);
  if ("response" in result) return result.response;
  const { user } = result;

  try {
    const project = await getProjectForUser(user.id);
    await connectDB();

    const chat = await ProjectChat.findOne({
      _id: params.id,
      userId: user.id,
      projectId: project.id,
    });

    if (!chat) {
      return NextResponse.json({ message: "Chat not found" }, { status: 404 });
    }

    return NextResponse.json({ chat: serializeChat(chat) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load chat";
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  props: { params: Promise<{ id: string }> },
) {
  const params = await props.params;
  const result = await requireUser(request);
  if ("response" in result) return result.response;
  const { user } = result;

  try {
    const project = await getProjectForUser(user.id);
    const projectDoc = await getProjectDocument(user.id, true);
    await connectDB();

    const body = (await request.json()) as { messageId?: unknown; content?: unknown };
    const messageId = String(body.messageId ?? "").trim();
    const content = String(body.content ?? "").trim();

    if (!messageId) {
      return NextResponse.json({ message: "Missing message." }, { status: 400 });
    }
    if (!content) {
      return NextResponse.json({ message: "Enter a message." }, { status: 400 });
    }

    const chat = await ProjectChat.findOne({
      _id: params.id,
      userId: user.id,
      projectId: project.id,
    });

    if (!chat) {
      return NextResponse.json({ message: "Chat not found" }, { status: 404 });
    }

    const index = chat.messages.findIndex((item) => item._id.toString() === messageId);
    if (index < 0) {
      return NextResponse.json({ message: "Message not found" }, { status: 404 });
    }

    const userMessage = chat.messages[index];
    if (userMessage.role !== "user") {
      return NextResponse.json({ message: "Only your messages can be edited." }, { status: 400 });
    }

    const following = chat.messages.slice(index + 1);
    const priorAssistant = following.find((item) => item.role === "assistant");

    userMessage.content = content;
    userMessage.editedAt = new Date();
    chat.messages.splice(index + 1);

    if (index === 0) {
      chat.title = content.length > 35 ? `${content.slice(0, 32)}...` : content;
    }

    const history = chat.messages.slice(0, index).map((item) => ({
      role: item.role as "user" | "assistant",
      content: item.content,
    }));

    const attachments = userMessage.attachments || [];
    const names = attachments.map((file) => file.name).filter(Boolean);
    const storedContext =
      typeof userMessage.fileContext === "string" ? userMessage.fileContext.trim() : "";

    const fileAnalysis: { report: string; synthesisBrief: string } | null = storedContext
      ? { report: storedContext, synthesisBrief: storedContext.slice(0, 2800) }
      : null;

    let agentPrompt = names.length ? `${content}\n\nAttached files: ${names.join(", ")}` : content;

    if (!fileAnalysis && names.length && priorAssistant?.content) {
      agentPrompt = `${content}\n\nThe user had uploaded: ${names.join(", ")}.\nUse this previous file read; do not repeat it verbatim unless asked:\n${priorAssistant.content.slice(0, 5000)}`;
    }

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

    chat.markModified("messages");
    await chat.save();

    return NextResponse.json({
      chat: serializeChat(chat),
      reply: suriReply,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not update message";
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  props: { params: Promise<{ id: string }> },
) {
  const params = await props.params;
  const result = await requireUser(request);
  if ("response" in result) return result.response;
  const { user } = result;

  try {
    const project = await getProjectForUser(user.id);
    await connectDB();

    await ProjectChat.deleteOne({
      _id: params.id,
      userId: user.id,
      projectId: project.id,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete chat";
    return NextResponse.json({ message }, { status: 500 });
  }
}

export const runtime = "nodejs";
export const maxDuration = 60;
