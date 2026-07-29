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
      className="space-y-5 rounded-md border border-white/10 bg-[#0d1117] p-6 md:p-8"
    >
      <label className="block">
        <span className="text-sm text-ink-muted">Name</span>
        <input
          name="name"
          required
          className="mt-2 w-full rounded-md border border-white/10 bg-[#010409] px-3 py-2.5 text-snow outline-none focus:border-accent"
        />
      </label>
      <label className="block">
        <span className="text-sm text-ink-muted">Email</span>
        <input
          name="email"
          type="email"
          required
          className="mt-2 w-full rounded-md border border-white/10 bg-[#010409] px-3 py-2.5 text-snow outline-none focus:border-accent"
        />
      </label>
      <label className="block">
        <span className="text-sm text-ink-muted">Topic</span>
        <select
          name="topic"
          className="mt-2 w-full rounded-md border border-white/10 bg-[#010409] px-3 py-2.5 text-snow outline-none focus:border-accent"
          defaultValue="Full stack project"
        >
          <option>Full stack project</option>
          <option>Website build</option>
          <option>SEO & ranking</option>
          <option>Keyword package</option>
          <option>Backlinks</option>
          <option>Other</option>
        </select>
      </label>
      <label className="block">
        <span className="text-sm text-ink-muted">Message</span>
        <textarea
          name="message"
          required
          rows={5}
          className="mt-2 w-full resize-y rounded-md border border-white/10 bg-[#010409] px-3 py-2.5 text-snow outline-none focus:border-accent"
          placeholder="Niche, market, timeline, and goals…"
        />
      </label>
      <button
        type="submit"
        className="w-full rounded-md bg-accent px-4 py-2.5 text-sm font-semibold text-[#010409] hover:bg-accent-deep sm:w-auto"
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
