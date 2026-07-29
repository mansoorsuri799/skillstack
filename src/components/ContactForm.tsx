"use client";

import { FormEvent, useState } from "react";

export default function ContactForm() {
  const [status, setStatus] = useState<"idle" | "sent">("idle");

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formEl = e.currentTarget;
    const form = new FormData(formEl);
    const name = String(form.get("name") || "");
    const email = String(form.get("email") || "");
    const topic = String(form.get("topic") || "");
    const message = String(form.get("message") || "");

    const subject = encodeURIComponent(
      `SkillStack inquiry — ${topic || "General"}`,
    );
    const body = encodeURIComponent(
      `Name: ${name}\nEmail: ${email}\nTopic: ${topic}\n\n${message}`,
    );
    window.location.href = `mailto:hello@skillstack.com.pk?subject=${subject}&body=${body}`;
    setStatus("sent");
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
          Opens your email app with everything filled in — no account required.
        </p>
      </div>
      <label className="block">
        <span className="text-sm text-ink-muted">Name</span>
        <input
          name="name"
          required
          className="mt-2 w-full rounded-md border border-white/10 bg-[#010409] px-3 py-2.5 text-snow outline-none transition-colors focus:border-accent"
        />
      </label>
      <label className="block">
        <span className="text-sm text-ink-muted">Email</span>
        <input
          name="email"
          type="email"
          required
          className="mt-2 w-full rounded-md border border-white/10 bg-[#010409] px-3 py-2.5 text-snow outline-none transition-colors focus:border-accent"
        />
      </label>
      <label className="block">
        <span className="text-sm text-ink-muted">Topic</span>
        <span className="relative mt-2 block">
          <select
            name="topic"
            className="w-full appearance-none rounded-md border border-white/10 bg-[#010409] py-2.5 pl-3 pr-11 text-snow outline-none transition-colors focus:border-[#2cd4bf]"
            defaultValue="Full stack project"
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
          className="mt-2 w-full resize-y rounded-md border border-white/10 bg-[#010409] px-3 py-2.5 text-snow outline-none transition-colors focus:border-accent"
          placeholder="Niche, market, timeline, and goals…"
        />
      </label>
      <button
        type="submit"
        className="w-full rounded-md bg-accent px-4 py-3 text-sm font-semibold text-[#010409] hover:bg-accent-deep sm:w-auto"
      >
        Open email draft
      </button>
      {status === "sent" ? (
        <p className="text-sm text-accent">
          Your mail app should open with the message filled in.
        </p>
      ) : null}
    </form>
  );
}
