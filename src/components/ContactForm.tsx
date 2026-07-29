"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { FormEvent, useEffect, useState } from "react";

export default function ContactForm() {
  const { data: session, status } = useSession();
  const [name, setName] = useState("");
  const [topic, setTopic] = useState("Full stack project");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (session?.user?.name) setName(session.user.name);
  }, [session?.user?.name]);

  if (status === "loading") {
    return (
      <div className="rounded-lg border border-white/10 bg-[#0d1117] px-6 py-10 text-center text-sm text-ink-muted md:px-8">
        Checking your session…
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="relative overflow-hidden rounded-lg border border-white/10 bg-[#0d1117] p-6 md:p-8">
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-accent via-accent/40 to-transparent"
        />
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-accent">
          Sign in required
        </p>
        <h3 className="mt-3 font-display text-xl font-semibold text-snow">
          Log in to send a brief
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-ink-muted">
          Contact submissions are limited to authenticated SkillStack accounts so
          we can reply to a verified email.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/login?callbackUrl=/contact"
            className="inline-flex rounded-md bg-accent px-5 py-2.5 text-sm font-semibold text-[#010409] hover:bg-accent-deep"
          >
            Sign in
          </Link>
          <Link
            href="/register?callbackUrl=/contact"
            className="inline-flex rounded-md border border-white/20 px-5 py-2.5 text-sm font-medium text-snow hover:bg-white/5"
          >
            Create account
          </Link>
        </div>
      </div>
    );
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, topic, message }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not send.");
        setLoading(false);
        return;
      }
      setSent(true);
      setMessage("");
    } catch {
      setError("Something went wrong. Please try again.");
    }
    setLoading(false);
  }

  return (
    <form
      onSubmit={onSubmit}
      className="relative space-y-5 overflow-hidden rounded-lg border border-white/10 bg-[#0d1117] p-6 md:p-8"
    >
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-accent via-accent/40 to-transparent"
      />
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-accent">
          Send a brief
        </p>
        <p className="mt-2 text-sm text-ink-muted">
          Signed in as{" "}
          <span className="text-snow">{session.user.email}</span>. We’ll reply to
          this address.
        </p>
      </div>
      <label className="block">
        <span className="text-sm text-ink-muted">Name</span>
        <input
          name="name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-2 w-full rounded-md border border-white/10 bg-[#010409] px-3 py-2.5 text-snow outline-none transition-colors focus:border-accent"
        />
      </label>
      <label className="block">
        <span className="text-sm text-ink-muted">Email</span>
        <input
          name="email"
          type="email"
          value={session.user.email ?? ""}
          readOnly
          className="mt-2 w-full rounded-md border border-white/10 bg-[#010409]/80 px-3 py-2.5 text-ink-muted outline-none"
        />
      </label>
      <label className="block">
        <span className="text-sm text-ink-muted">Topic</span>
        <span className="relative mt-2 block">
          <select
            name="topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="w-full appearance-none rounded-md border border-white/10 bg-[#010409] py-2.5 pl-3 pr-11 text-snow outline-none transition-colors focus:border-[#2cd4bf]"
          >
            <option>Full stack project</option>
            <option>Website build</option>
            <option>SEO & ranking</option>
            <option>Keyword package</option>
            <option>Backlinks</option>
            <option>Other</option>
          </select>
          <span
            aria-hidden
            className="pointer-events-none absolute inset-y-0 right-0 flex w-11 items-center justify-center"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#2cd4bf]/15 ring-1 ring-[#2cd4bf]/35">
              <svg
                viewBox="0 0 16 16"
                className="h-3.5 w-3.5 text-[#2cd4bf]"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M4 6.25 8 10l4-3.75"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </span>
        </span>
      </label>
      <label className="block">
        <span className="text-sm text-ink-muted">Message</span>
        <textarea
          name="message"
          required
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="mt-2 w-full resize-y rounded-md border border-white/10 bg-[#010409] px-3 py-2.5 text-snow outline-none transition-colors focus:border-accent"
          placeholder="Niche, market, timeline, and goals…"
        />
      </label>
      <button
        type="submit"
        disabled={loading || sent}
        className="w-full rounded-md bg-accent px-4 py-3 text-sm font-semibold text-[#010409] hover:bg-accent-deep disabled:opacity-60 sm:w-auto"
      >
        {loading ? "Sending…" : sent ? "Sent" : "Send brief"}
      </button>
      {error ? <p className="text-sm text-red-300">{error}</p> : null}
      {sent ? (
        <p className="text-sm text-accent">
          Thanks — your brief was sent. We’ll reply within 1–2 business days.
        </p>
      ) : null}
    </form>
  );
}
