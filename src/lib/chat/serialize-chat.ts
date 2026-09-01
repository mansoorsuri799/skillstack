type SourceLike = { title?: string | null; url?: string | null };
type AttachmentLike = {
  name?: string | null;
  mimeType?: string | null;
  size?: number | null;
  kind?: string | null;
};

type MessageLike = {
  _id?: { toString(): string };
  id?: string;
  role: "user" | "assistant";
  content: string;
  sources?: SourceLike[];
  attachments?: AttachmentLike[];
  createdAt?: Date | string;
  editedAt?: Date | string | null;
};

type ChatLike = {
  _id: { toString(): string };
  title: string;
  messages: MessageLike[];
  createdAt: Date | string;
  updatedAt: Date | string;
};

export function serializeChatMessage(message: MessageLike) {
  const id = message.id || message._id?.toString() || "";
  return {
    id,
    role: message.role,
    content: message.content,
    sources: (message.sources || []).map((source) => ({
      title: source.title || "",
      url: source.url || "",
    })),
    attachments: (message.attachments || []).map((file) => ({
      name: file.name || "",
      mimeType: file.mimeType || "",
      size: file.size || 0,
      kind: (file.kind as "image" | "document" | "archive" | "spreadsheet") || "document",
    })),
    createdAt: message.createdAt,
    editedAt: message.editedAt || null,
  };
}

export function serializeChat(chat: ChatLike) {
  return {
    id: chat._id.toString(),
    title: chat.title,
    messages: (chat.messages || []).map(serializeChatMessage),
    createdAt: chat.createdAt,
    updatedAt: chat.updatedAt,
  };
}
