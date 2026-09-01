"use client";

import {
  KeyboardEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  ArrowUp,
  Bot,
  BrainCircuit,
  Check,
  Copy,
  ExternalLink,
  FileArchive,
  FileSpreadsheet,
  FileText,
  ImageIcon,
  Paperclip,
  Pencil,
  Plus,
  Terminal,
  User,
  X,
} from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { TopUpgradeBanner } from "@/components/dashboard/PaidFeatureUnlockCard";
import {
  DashboardAlert,
} from "@/components/dashboard/ui";
import { useDashboardProject } from "@/components/dashboard/useDashboardProject";
import {
  CHAT_FILE_ACCEPT,
  DEFAULT_FILE_ANALYSIS_PROMPT,
  formatFileSize,
  isAllowedChatFile,
  kindFromName,
  MAX_CHAT_FILES,
  validateChatFiles,
  type ChatAttachmentKind,
  type ChatAttachmentMeta,
} from "@/lib/chat/file-types";

type ChatMessage = {
  id?: string;
  role: "user" | "assistant";
  content: string;
  sources?: Array<{ title: string; url: string }>;
  attachments?: ChatAttachmentMeta[];
  createdAt?: string | Date;
  editedAt?: string | Date | null;
};

type PendingUpload = {
  id: string;
  file: File;
  previewUrl: string | null;
};

const QUICK_STARTERS = [
  "What keywords should I focus on next?",
  "Who are my top SERP competitors?",
  "How is my Search Console traffic trending?",
  "Find quick-win keywords I already rank for",
];

function KindIcon({ kind, className = "h-3.5 w-3.5" }: { kind: ChatAttachmentKind; className?: string }) {
  if (kind === "image") return <ImageIcon className={className} />;
  if (kind === "archive") return <FileArchive className={className} />;
  if (kind === "spreadsheet") return <FileSpreadsheet className={className} />;
  return <FileText className={className} />;
}

function AttachmentChips({
  items,
  onRemove,
}: {
  items: Array<{
    id?: string;
    name: string;
    size: number;
    kind: ChatAttachmentKind;
    previewUrl?: string | null;
  }>;
  onRemove?: (id: string) => void;
}) {
  if (!items.length) return null;

  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item, idx) => (
        <div
          key={item.id || `${item.name}-${idx}`}
          className="flex max-w-full items-center gap-2 rounded-xl border border-line bg-bg px-2 py-1.5 text-[11px] text-snow"
        >
          {item.previewUrl ? (
            <div
              aria-hidden
              className="h-8 w-8 rounded-md border border-white/10 bg-cover bg-center"
              style={{ backgroundImage: `url("${item.previewUrl}")` }}
            />
          ) : (
            <span className="flex h-8 w-8 items-center justify-center rounded-md border border-line bg-white/5 text-accent">
              <KindIcon kind={item.kind} />
            </span>
          )}
          <span className="min-w-0">
            <span className="block max-w-[140px] truncate font-medium">{item.name}</span>
            <span className="text-ink-muted">{formatFileSize(item.size)}</span>
          </span>
          {onRemove && item.id ? (
            <button
              type="button"
              onClick={() => onRemove(item.id!)}
              className="rounded-full p-0.5 text-ink-muted hover:bg-white/10 hover:text-snow"
              title="Remove file"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          ) : null}
        </div>
      ))}
    </div>
  );
}

function ChatRichText({ content }: { content: string }) {
  const blocks = content.split(/\n{2,}/);

  return (
    <div className="space-y-3 text-xs sm:text-sm leading-relaxed">
      {blocks.map((block, index) => (
        <p key={index} className="whitespace-pre-wrap">
          {renderInline(block)}
        </p>
      ))}
    </div>
  );
}

function renderInline(text: string) {
  const parts = text.split(/(\*\*[^*\n]+\*\*|https?:\/\/[^\s]+)/g);
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={index} className="font-semibold text-snow">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (/^https?:\/\//.test(part)) {
      return (
        <a
          key={index}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="break-all text-accent hover:underline"
        >
          {part}
        </a>
      );
    }
    return <span key={index}>{part}</span>;
  });
}

function MessageBubble({
  msg,
  canEdit = false,
  isEditing = false,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
}: {
  msg: ChatMessage;
  canEdit?: boolean;
  isEditing?: boolean;
  onStartEdit?: () => void;
  onCancelEdit?: () => void;
  onSaveEdit?: (content: string) => void;
}) {
  const [copied, setCopied] = useState(false);
  const [draft, setDraft] = useState(msg.content);
  const editRef = useRef<HTMLTextAreaElement>(null);

  function copyText() {
    void navigator.clipboard.writeText(msg.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function beginEdit() {
    setDraft(msg.content);
    onStartEdit?.();
  }

  function saveEdit() {
    const next = draft.trim();
    if (!next) return;
    if (next === msg.content.trim()) {
      onCancelEdit?.();
      return;
    }
    onSaveEdit?.(next);
  }

  useEffect(() => {
    if (!isEditing) return;
    const el = editRef.current;
    if (!el) return;
    el.focus();
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 180)}px`;
  }, [isEditing]);

  const isUser = msg.role === "user";
  const attachments = msg.attachments || [];

  return (
    <div className={`flex w-full gap-2.5 sm:gap-4 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser ? (
        <div className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 select-none items-center justify-center rounded-xl border border-accent/30 bg-accent/10 text-accent">
          <Bot className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        </div>
      ) : null}

      <div
        className={`relative max-w-[92%] sm:max-w-[80%] rounded-2xl p-3.5 sm:p-4 text-xs sm:text-sm leading-relaxed transition-all ${
          isUser
            ? "border border-accent/30 bg-accent/[0.12] text-snow font-medium shadow-md"
            : "border border-line bg-bg-elevated text-ink shadow-sm"
        }`}
      >
        <div className="flex items-center justify-between gap-3 border-b border-white/[0.06] pb-1.5 mb-2 text-[10px] sm:text-[11px] text-ink-muted">
          <span className="flex items-center gap-1.5 font-semibold uppercase tracking-wider text-accent">
            {isUser ? "You" : "Suri • SEO Agent"}
            {isUser && msg.editedAt ? (
              <span className="font-medium normal-case tracking-normal text-ink-muted/80">Edited</span>
            ) : null}
          </span>
          {isUser && canEdit && !isEditing ? (
            <button
              type="button"
              onClick={beginEdit}
              className="rounded p-1 text-ink-muted hover:bg-white/5 hover:text-snow transition"
              title="Edit message"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
          ) : !isUser ? (
            <button
              type="button"
              onClick={copyText}
              className="rounded p-1 text-ink-muted hover:bg-white/5 hover:text-snow transition"
              title="Copy response"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-accent" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
          ) : null}
        </div>

        {attachments.length > 0 ? (
          <div className="mb-2">
            <AttachmentChips
              items={attachments.map((a) => ({
                name: a.name,
                size: a.size,
                kind: a.kind,
              }))}
            />
          </div>
        ) : null}

        {isEditing ? (
          <div className="space-y-2">
            <textarea
              ref={editRef}
              value={draft}
              onChange={(e) => {
                setDraft(e.target.value);
                e.target.style.height = "auto";
                e.target.style.height = `${Math.min(e.target.scrollHeight, 180)}px`;
              }}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  e.preventDefault();
                  onCancelEdit?.();
                }
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  saveEdit();
                }
              }}
              rows={2}
              className="w-full resize-none rounded-xl border border-accent/40 bg-bg px-3 py-2 text-xs sm:text-sm text-snow focus:outline-none focus:ring-1 focus:ring-accent/40"
            />
            <div className="flex items-center justify-end gap-1.5">
              <button
                type="button"
                onClick={onCancelEdit}
                className="rounded-lg border border-line px-2.5 py-1 text-[11px] text-ink-muted hover:text-snow"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveEdit}
                disabled={!draft.trim()}
                className="rounded-lg bg-accent px-2.5 py-1 text-[11px] font-semibold text-[#010409] hover:bg-accent-deep disabled:opacity-40"
              >
                Save
              </button>
            </div>
          </div>
        ) : isUser ? (
          <div className="whitespace-pre-wrap leading-relaxed space-y-2">
            {msg.content}
          </div>
        ) : (
          <ChatRichText content={msg.content} />
        )}

        {msg.sources && msg.sources.length > 0 ? (
          <div className="mt-3 sm:mt-4 border-t border-line/60 pt-2.5 sm:pt-3 space-y-2">
            <p className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
              Cited Evidence & Data:
            </p>
            <div className="grid gap-1.5 sm:grid-cols-2">
              {msg.sources.map((s, idx) => (
                <a
                  key={idx}
                  href={s.url || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between gap-2 rounded-lg border border-line bg-bg px-2.5 py-1.5 text-xs text-snow/90 transition hover:border-accent/40 hover:text-accent"
                >
                  <span className="truncate">{s.title || s.url}</span>
                  <ExternalLink className="h-3 w-3 shrink-0 text-ink-muted" />
                </a>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      {isUser ? (
        <div className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 select-none items-center justify-center rounded-xl border border-line bg-bg text-ink-muted">
          <User className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        </div>
      ) : null}
    </div>
  );
}

export default function ChatPage() {
  const { project } = useDashboardProject();
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentChatId = searchParams.get("id");

  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(currentChatId);
  const [chatTitle, setChatTitle] = useState("New chat");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [memoryOpen, setMemoryOpen] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<PendingUpload[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  useEffect(() => {
    return () => {
      pendingFiles.forEach((file) => {
        if (file.previewUrl) URL.revokeObjectURL(file.previewUrl);
      });
    };
    // Only run on unmount; pendingFiles cleanup is handled in add/remove helpers.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadChat = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/dashboard/chat/${id}`);
      if (!res.ok) return;
      const data = await res.json();
      if (data.chat) {
        setActiveChatId(data.chat.id);
        setChatTitle(data.chat.title || "New chat");
        setMessages(data.chat.messages || []);
      }
    } catch {
      /* ignore */
    }
  }, []);

  /* eslint-disable react-hooks/set-state-in-effect -- hydrate or reset from the chat URL */
  useEffect(() => {
    if (currentChatId) {
      void loadChat(currentChatId);
    } else {
      setActiveChatId(null);
      setChatTitle("New chat");
      setMessages([]);
      setEditingId(null);
    }
  }, [currentChatId, loadChat]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const clearPendingFiles = useCallback(() => {
    setPendingFiles((prev) => {
      prev.forEach((file) => {
        if (file.previewUrl) URL.revokeObjectURL(file.previewUrl);
      });
      return [];
    });
  }, []);

  function addFiles(list: File[]) {
    setError("");
    const incoming = list.filter((file) => file.size > 0);
    if (!incoming.length) return;

    const named = incoming.map((file) => {
      if (file.name && isAllowedChatFile(file.name)) return file;
      if (file.type.startsWith("image/")) {
        const ext = file.type.split("/")[1] === "jpeg" ? "jpg" : file.type.split("/")[1];
        return new File([file], file.name || `pasted-image.${ext || "png"}`, { type: file.type });
      }
      return file;
    });

    setPendingFiles((prev) => {
      const merged = [...prev];
      for (const file of named) {
        if (merged.length >= MAX_CHAT_FILES) break;
        const duplicate = merged.some(
          (item) => item.file.name === file.name && item.file.size === file.size,
        );
        if (duplicate) continue;
        merged.push({
          id: `${file.name}-${file.size}-${file.lastModified}-${Math.random().toString(36).slice(2, 7)}`,
          file,
          previewUrl: file.type.startsWith("image/") ? URL.createObjectURL(file) : null,
        });
      }
      const invalid = validateChatFiles(merged.map((item) => item.file));
      if (invalid) {
        setError(invalid);
        merged.slice(prev.length).forEach((item) => {
          if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
        });
        return prev;
      }
      return merged;
    });
  }

  function removePendingFile(id: string) {
    setPendingFiles((prev) => {
      const target = prev.find((item) => item.id === id);
      if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((item) => item.id !== id);
    });
  }

  async function handleSend(customPrompt?: string) {
    const promptToSend = (customPrompt || input).trim();
    if ((!promptToSend && pendingFiles.length === 0) || loading) return;

    setError("");
    const uploads = pendingFiles;
    const attachments: ChatAttachmentMeta[] = uploads.map((item) => ({
      name: item.file.name,
      mimeType: item.file.type,
      size: item.file.size,
      kind: kindFromName(item.file.name, item.file.type),
    }));
    const userContent = promptToSend || DEFAULT_FILE_ANALYSIS_PROMPT;
    const userMsg: ChatMessage = {
      role: "user",
      content: userContent,
      attachments,
      createdAt: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    clearPendingFiles();
    setLoading(true);

    try {
      const form = new FormData();
      form.append("message", userContent);
      if (activeChatId) form.append("chatId", activeChatId);
      for (const item of uploads) {
        form.append("files", item.file, item.file.name);
      }

      const res = await fetch("/api/dashboard/chat", {
        method: "POST",
        body: form,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to get reply from Suri");

      if (data.chat?.id && !activeChatId) {
        setActiveChatId(data.chat.id);
        setChatTitle(data.chat.title);
        window.history.replaceState(null, "", `/dashboard/chat?id=${data.chat.id}`);
        window.dispatchEvent(new CustomEvent("refresh-chats"));
      }

      if (Array.isArray(data.chat?.messages) && data.chat.messages.length) {
        setMessages(data.chat.messages);
      } else {
        const assistantMsg: ChatMessage = {
          role: "assistant",
          content: data.reply.answer,
          sources: data.reply.sources || [],
          createdAt: new Date(),
        };
        setMessages((prev) => [...prev, assistantMsg]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Suri query failed");
    } finally {
      setLoading(false);
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  }

  function startNewChat() {
    setActiveChatId(null);
    setChatTitle("New chat");
    setMessages([]);
    setEditingId(null);
    clearPendingFiles();
    router.push("/dashboard/chat");
  }

  async function handleEditMessage(message: ChatMessage, content: string) {
    if (!message.id || !activeChatId || loading) return;
    const next = content.trim();
    if (!next) return;

    setError("");
    setEditingId(null);
    setLoading(true);
    setMessages((prev) => {
      const index = prev.findIndex((item) => item.id === message.id);
      if (index < 0) return prev;
      const copy = prev.slice(0, index + 1);
      copy[index] = { ...copy[index], content: next, editedAt: new Date() };
      return copy;
    });

    try {
      const res = await fetch(`/api/dashboard/chat/${activeChatId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messageId: message.id, content: next }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Could not update message");

      if (Array.isArray(data.chat?.messages)) {
        setMessages(data.chat.messages);
      }
      if (data.chat?.title) setChatTitle(data.chat.title);
      window.dispatchEvent(new CustomEvent("refresh-chats"));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update message");
      void loadChat(activeChatId);
    } finally {
      setLoading(false);
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  }

  const canSend = !loading && (Boolean(input.trim()) || pendingFiles.length > 0);

  return (
    <DashboardShell title="Suri SEO Agent" fill>
      <div className="mx-auto flex min-h-0 w-full max-w-5xl flex-1 flex-col">
        <div className="mb-4 shrink-0">
          <TopUpgradeBanner />
        </div>

        <div className="flex shrink-0 items-center justify-between border-b border-line/60 pb-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-snow">{chatTitle}</span>
            {messages.length > 0 ? (
              <button
                type="button"
                onClick={startNewChat}
                className="flex items-center gap-1 text-[11px] text-ink-muted hover:text-accent ml-2"
              >
                <Plus className="h-3 w-3" /> New
              </button>
            ) : null}
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => setMemoryOpen((v) => !v)}
              className="flex items-center gap-1.5 rounded-lg border border-line bg-white/5 px-2.5 py-1 text-ink-muted hover:text-snow hover:border-accent/40 transition"
            >
              <BrainCircuit className="h-3.5 w-3.5 text-accent" />
              <span>Project memory</span>
            </button>

            {memoryOpen ? (
              <div className="absolute right-0 top-full mt-2 w-[calc(100vw-32px)] sm:w-72 max-w-xs rounded-xl border border-line bg-bg-elevated p-3 text-xs shadow-2xl z-50 space-y-2">
                <div className="flex items-center justify-between border-b border-white/[0.06] pb-1.5 font-semibold text-snow">
                  <span className="flex items-center gap-1.5">
                    <Terminal className="h-3.5 w-3.5 text-accent" />
                    Project Context
                  </span>
                  <span className="text-[10px] text-accent font-medium font-mono">SYNCED</span>
                </div>
                <div className="space-y-1 text-ink-muted">
                  <p><strong className="text-snow">Target Domain:</strong> {project?.domain || "None"}</p>
                  <p><strong className="text-snow">Project Name:</strong> {project?.name || "None"}</p>
                  <p>
                    <strong className="text-snow">GSC Linked:</strong>{" "}
                    {project?.gscConnected ? "Connected" : "Not connected"}
                  </p>
                </div>
                <p className="text-[11px] text-ink-muted/70 pt-1 border-t border-white/[0.04]">
                  Suri uses this project domain for live SERP competitor searches. Add a real domain first — placeholder sites like example.com are skipped.
                </p>
              </div>
            ) : null}
          </div>
        </div>

        {error ? (
          <div className="shrink-0 pt-3">
            <DashboardAlert variant="error">{error}</DashboardAlert>
          </div>
        ) : null}

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain py-4">
          {messages.length === 0 ? (
            <div className="max-w-2xl mx-auto py-12 text-center space-y-6">
              <div className="space-y-3">
                <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl border border-line bg-bg-elevated text-accent">
                  <Terminal className="h-5 w-5" />
                </div>
                <h2 className="font-display text-base md:text-lg font-medium text-snow leading-relaxed">
                  Hey, I&apos;m Suri — your in-app SEO agent for SkillStack. I can research keywords, size up competitors, read your SERPs, backlinks, rank tracking, and Search Console, and turn it into next steps for this project.
                </h2>
                <p className="text-xs text-ink-muted">
                  Ask me anything, attach ZIP files, images, or documents for analysis, or start with one of these:
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                {QUICK_STARTERS.map((starter, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => void handleSend(starter)}
                    className="rounded-lg border border-line bg-bg-elevated px-3.5 py-1.5 text-xs font-medium text-snow/90 transition hover:border-accent/40 hover:bg-white/5 hover:text-accent shadow-sm"
                  >
                    {starter}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {messages.map((m, idx) => (
                <MessageBubble
                  key={m.id || idx}
                  msg={m}
                  canEdit={m.role === "user" && Boolean(m.id) && !loading}
                  isEditing={Boolean(m.id) && editingId === m.id}
                  onStartEdit={() => m.id && setEditingId(m.id)}
                  onCancelEdit={() => setEditingId(null)}
                  onSaveEdit={(content) => void handleEditMessage(m, content)}
                />
              ))}
            </div>
          )}

          {loading ? (
            <div className="flex items-center gap-3 rounded-2xl border border-line bg-bg-elevated p-4 text-xs text-ink-muted animate-pulse max-w-md">
              <Bot className="h-4 w-4 text-accent animate-spin" />
              <span>
                {messages[messages.length - 1]?.content?.toLowerCase().includes("competitor") ||
                messages[messages.length - 1]?.content?.toLowerCase().includes("serp")
                  ? "Suri is running a live SERP search for your domain..."
                  : messages[messages.length - 1]?.attachments?.length
                  ? "Suri is reading your files and drafting recommendations..."
                  : "Suri is analyzing project metrics and SERPs..."}
              </span>
            </div>
          ) : null}

          <div ref={messagesEndRef} />
        </div>

        <div className="relative z-10 shrink-0 bg-bg-soft pt-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <div
            className={`relative border bg-bg-elevated transition shadow-2xl ${
              pendingFiles.length > 0 ? "rounded-2xl" : "rounded-full"
            } ${
              dragOver
                ? "border-accent ring-1 ring-accent/30"
                : "border-line focus-within:border-accent focus-within:ring-1 focus-within:ring-accent/30"
            }`}
            onDragEnter={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={(e) => {
              if (e.currentTarget.contains(e.relatedTarget as Node)) return;
              setDragOver(false);
            }}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              addFiles(Array.from(e.dataTransfer.files || []));
            }}
          >
            {pendingFiles.length > 0 ? (
              <div className="px-3 pt-3">
                <AttachmentChips
                  items={pendingFiles.map((item) => ({
                    id: item.id,
                    name: item.file.name,
                    size: item.file.size,
                    kind: kindFromName(item.file.name, item.file.type),
                    previewUrl: item.previewUrl,
                  }))}
                  onRemove={removePendingFile}
                />
              </div>
            ) : null}

            <div className="relative flex items-center px-2 py-2 sm:px-3">
              <input
                ref={fileRef}
                type="file"
                multiple
                accept={CHAT_FILE_ACCEPT}
                className="hidden"
                onChange={(e) => {
                  addFiles(Array.from(e.target.files || []));
                  e.target.value = "";
                }}
              />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={loading}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-ink-muted transition hover:bg-white/5 hover:text-accent disabled:opacity-40"
                title="Attach ZIP, images, or documents"
              >
                <Paperclip className="h-4 w-4" />
              </button>

              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                onPaste={(e) => {
                  const files = e.clipboardData?.files;
                  if (files && files.length > 0) {
                    e.preventDefault();
                    addFiles(Array.from(files));
                  }
                }}
                placeholder={pendingFiles.length ? "Add a note, or send to analyze..." : "Ask Suri, or drop files to analyze..."}
                rows={1}
                disabled={loading}
                className="flex-1 max-h-32 min-h-[36px] resize-none bg-transparent py-1.5 pr-12 text-sm text-snow placeholder:text-ink-muted/60 focus:outline-none leading-relaxed"
              />

              <button
                type="button"
                onClick={() => void handleSend()}
                disabled={!canSend}
                className={`absolute right-3 flex h-8 w-8 items-center justify-center rounded-full transition ${
                  canSend
                    ? "bg-accent text-[#010409] hover:bg-accent-deep shadow-md cursor-pointer font-bold scale-100"
                    : "bg-white/5 text-ink-muted/40 cursor-not-allowed opacity-50"
                }`}
                title="Send to Suri (Enter)"
              >
                <ArrowUp className="h-4 w-4 stroke-[2.5]" />
              </button>
            </div>
          </div>
          <p className="mt-2 px-3 text-[11px] text-ink-muted/70">
            ZIP, images, PDF, Word, CSV, HTML · up to {MAX_CHAT_FILES} files, 8 MB each
          </p>
        </div>
      </div>
    </DashboardShell>
  );
}
