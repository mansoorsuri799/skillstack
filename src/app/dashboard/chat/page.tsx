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
  Plus,
  Sparkles,
  User,
} from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { TopUpgradeBanner } from "@/components/dashboard/PaidFeatureUnlockCard";
import {
  DashboardAlert,
  PageStack,
} from "@/components/dashboard/ui";
import { useDashboardProject } from "@/components/dashboard/useDashboardProject";

type ChatMessage = {
  id?: string;
  role: "user" | "assistant";
  content: string;
  sources?: Array<{ title: string; url: string }>;
  createdAt?: string | Date;
};

const QUICK_STARTERS = [
  "What keywords should I focus on next?",
  "Who are my top SERP competitors?",
  "How is my Search Console traffic trending?",
  "Find quick-win keywords I already rank for",
];

function MessageBubble({ msg }: { msg: ChatMessage }) {
  const [copied, setCopied] = useState(false);

  function copyText() {
    void navigator.clipboard.writeText(msg.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const isUser = msg.role === "user";

  return (
    <div className={`flex w-full gap-3 md:gap-4 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser ? (
        <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-xl border border-accent/30 bg-accent/10 text-accent">
          <Bot className="h-4 w-4" />
        </div>
      ) : null}

      <div
        className={`relative max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed transition-all md:max-w-[76%] ${
          isUser
            ? "border border-accent/30 bg-accent/[0.12] text-snow font-medium shadow-md"
            : "border border-line bg-bg-elevated text-ink shadow-sm"
        }`}
      >
        <div className="flex items-center justify-between gap-4 border-b border-white/[0.06] pb-2 mb-2 text-[11px] text-ink-muted">
          <span className="font-semibold uppercase tracking-wider text-accent">
            {isUser ? "You" : "Suri • SEO Agent"}
          </span>
          {!isUser ? (
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

        <div className="whitespace-pre-wrap leading-relaxed space-y-2">
          {msg.content}
        </div>

        {/* Cited Sources */}
        {msg.sources && msg.sources.length > 0 ? (
          <div className="mt-4 border-t border-line/60 pt-3 space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
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
        <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-xl border border-line bg-bg text-ink-muted">
          <User className="h-4 w-4" />
        </div>
      ) : null}
    </div>
  );
}

export default function ChatPage() {
  const { project, loading: projectLoading } = useDashboardProject();
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

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

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

  useEffect(() => {
    if (currentChatId) {
      void loadChat(currentChatId);
    } else {
      setActiveChatId(null);
      setChatTitle("New chat");
      setMessages([]);
    }
  }, [currentChatId, loadChat]);

  async function handleSend(customPrompt?: string) {
    const promptToSend = (customPrompt || input).trim();
    if (!promptToSend || loading) return;

    setError("");
    const userMsg: ChatMessage = {
      role: "user",
      content: promptToSend,
      createdAt: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/dashboard/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chatId: activeChatId,
          message: promptToSend,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to get reply from Suri");

      if (data.chat?.id && !activeChatId) {
        setActiveChatId(data.chat.id);
        setChatTitle(data.chat.title);
        window.history.replaceState(null, "", `/dashboard/chat?id=${data.chat.id}`);
        window.dispatchEvent(new CustomEvent("refresh-chats"));
      }

      const assistantMsg: ChatMessage = {
        role: "assistant",
        content: data.reply.answer,
        sources: data.reply.sources || [],
        createdAt: new Date(),
      };

      setMessages((prev) => [...prev, assistantMsg]);
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
    router.push("/dashboard/chat");
  }

  return (
    <DashboardShell title="Suri SEO Agent">
      <PageStack className="max-w-5xl mx-auto flex flex-col min-h-[calc(100vh-130px)]">
        <TopUpgradeBanner />

        {/* Chat Header Row: Title on Left, Project Memory on Right */}
        <div className="flex items-center justify-between border-b border-line/60 pb-3 text-xs">
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
              <div className="absolute right-0 top-full mt-2 w-72 rounded-xl border border-line bg-bg-elevated p-3 text-xs shadow-2xl z-50 space-y-2">
                <div className="flex items-center justify-between border-b border-white/[0.06] pb-1.5 font-semibold text-snow">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-accent" />
                    Project Context
                  </span>
                  <span className="text-[10px] text-accent font-medium">Active Sync</span>
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
                  Suri uses this project context to tailor all keyword, SERP, and traffic answers specifically for {project?.domain}.
                </p>
              </div>
            ) : null}
          </div>
        </div>

        {error ? <DashboardAlert variant="error">{error}</DashboardAlert> : null}

        {/* Chat Stream Messages or Welcome Hero */}
        <div className="flex-1 space-y-4 py-4 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="max-w-2xl mx-auto py-12 text-center space-y-6">
              <div className="space-y-3">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-accent/30 bg-accent/10 text-accent">
                  <Sparkles className="h-6 w-6" />
                </div>
                <h2 className="font-display text-base md:text-lg font-medium text-snow leading-relaxed">
                  Hey, I&apos;m Suri — your in-app SEO agent for SkillStack. I can research keywords, size up competitors, read your SERPs, backlinks, rank tracking, and Search Console, and turn it into next steps for this project.
                </h2>
                <p className="text-xs text-ink-muted">
                  Ask me anything, or start with one of these:
                </p>
              </div>

              {/* Quick Starter Pill Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                {QUICK_STARTERS.map((starter, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => void handleSend(starter)}
                    className="rounded-full border border-line bg-bg-elevated px-4 py-2 text-xs font-medium text-snow/90 transition hover:border-accent/40 hover:bg-bg-elevated/80 hover:text-accent shadow-sm"
                  >
                    {starter}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {messages.map((m, idx) => (
                <MessageBubble key={idx} msg={m} />
              ))}
            </div>
          )}

          {loading ? (
            <div className="flex items-center gap-3 rounded-2xl border border-line bg-bg-elevated p-4 text-xs text-ink-muted animate-pulse max-w-md">
              <Bot className="h-4 w-4 text-accent animate-spin" />
              <span>Suri is analyzing project metrics and SERPs...</span>
            </div>
          ) : null}

          <div ref={messagesEndRef} />
        </div>

        {/* Bottom Input Pill */}
        <div className="sticky bottom-0 pt-2 pb-4">
          <div className="relative flex items-center rounded-full border border-line bg-[#161b22] px-5 py-2 transition focus-within:border-accent focus-within:ring-1 focus-within:ring-accent/30 shadow-xl">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask Suri to research, analyze, or track anything..."
              rows={1}
              disabled={loading}
              className="flex-1 max-h-32 min-h-[36px] resize-none bg-transparent py-1.5 pr-12 text-sm text-snow placeholder:text-ink-muted/60 focus:outline-none leading-relaxed"
            />

            <button
              type="button"
              onClick={() => void handleSend()}
              disabled={loading || !input.trim()}
              className={`absolute right-2.5 flex h-8 w-8 items-center justify-center rounded-full transition ${
                input.trim() && !loading
                  ? "bg-accent text-[#010409] hover:bg-accent-deep shadow-md cursor-pointer font-bold scale-100"
                  : "bg-white/5 text-ink-muted/40 cursor-not-allowed opacity-50"
              }`}
              title="Send to Suri (Enter)"
            >
              <ArrowUp className="h-4 w-4 stroke-[2.5]" />
            </button>
          </div>
        </div>
      </PageStack>
    </DashboardShell>
  );
}
