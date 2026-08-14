"use client";

import Link from "next/link";
import { FormEvent, useEffect, useRef, useState } from "react";
import type { TeamExpert } from "@/lib/team";

type ChatMessage = {
  id: string;
  sender: "user" | "expert";
  body: string;
  createdAt: string;
};

export default function TeamChat({ expert }: { expert: TeamExpert }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      const res = await fetch(`/api/chat/${expert.id}`);
      const data = await res.json();
      if (!cancelled && res.ok) {
        setMessages(data.messages ?? []);
      }
      if (!cancelled) setLoading(false);
    }
    void load();
    const t = window.setInterval(() => {
      void fetch(`/api/chat/${expert.id}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.messages) setMessages(data.messages);
        })
        .catch(() => {});
    }, 8000);
    return () => {
      cancelled = true;
      window.clearInterval(t);
    };
  }, [expert.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const body = text.trim();
    if (!body || sending) return;
    setSending(true);
    setError("");
    setText("");
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ expertId: expert.id, body }),
    });
    const data = await res.json();
    setSending(false);
    if (!res.ok) {
      setError(data.error || "Could not send.");
      setText(body);
      return;
    }
    setMessages((prev) => [...prev, ...(data.messages ?? [])]);
  }

  return (
    <div className="flex h-[calc(100svh-8.5rem)] flex-col overflow-hidden rounded-xl border border-white/10 bg-[#0d1117] md:h-[calc(100svh-7rem)]">
      <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
        <Link href="/dashboard/team" className="text-xs text-white/45 hover:text-accent md:hidden">
          ← Team
        </Link>
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-xs font-bold text-white ${expert.tone}`}
        >
          {expert.initials}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-snow">{expert.name}</p>
          <p className="truncate text-xs text-ink-muted">
            {expert.role} · {expert.status === "online" ? "Online" : "Away"}
          </p>
        </div>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {loading ? (
          <p className="text-sm text-ink-muted">Loading conversation…</p>
        ) : messages.length === 0 ? (
          <p className="text-sm text-ink-muted">
            Say hello to {expert.name.split(" ")[0]}. They’ll reply in this thread with next steps for{" "}
            {expert.specialty}.
          </p>
        ) : (
          messages.map((m) => (
            <div
              key={m.id}
              className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                  m.sender === "user"
                    ? "bg-accent text-[#010409]"
                    : "border border-white/10 bg-[#161b22] text-snow"
                }`}
              >
                {m.body}
              </div>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={onSubmit} className="border-t border-white/10 p-3">
        {error ? <p className="mb-2 text-xs text-red-300">{error}</p> : null}
        <div className="flex gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={`Message ${expert.name.split(" ")[0]}…`}
            maxLength={4000}
            className="flex-1 rounded-md border border-white/15 bg-[#010409] px-3 py-2 text-sm text-snow outline-none placeholder:text-white/30 focus:border-accent"
          />
          <button
            type="submit"
            disabled={sending || !text.trim()}
            className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-[#010409] hover:bg-accent-deep disabled:opacity-50"
          >
            {sending ? "…" : "Send"}
          </button>
        </div>
      </form>
    </div>
  );
}
