"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, KeyboardEvent, useEffect, useState } from "react";
import type { PublicProfile } from "@/models/User";

const inputClass =
  "mt-2 w-full rounded-md border border-white/10 bg-[#010409] px-3 py-2.5 text-snow outline-none transition-colors focus:border-accent";

export default function ProfileEditor() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const [email, setEmail] = useState("");
  const [skillDraft, setSkillDraft] = useState("");
  const [form, setForm] = useState({
    name: "",
    username: "",
    headline: "",
    bio: "",
    skills: [] as string[],
    location: "",
    company: "",
    website: "",
    linkedin: "",
    xProfile: "",
    availableForWork: false,
    image: null as string | null,
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/profile");
        if (res.status === 401) {
          window.location.href = `/login?callbackUrl=${encodeURIComponent("/profile")}`;
          return;
        }
        const data = await res.json();
        if (!res.ok) {
          if (!cancelled) setError(data.error || "Could not load profile.");
          return;
        }
        if (cancelled) return;
        const p = data.profile as PublicProfile;
        setEmail(data.email || "");
        setForm({
          name: p.name || "",
          username: p.username || "",
          headline: p.headline || "",
          bio: p.bio || "",
          skills: p.skills || [],
          location: p.location || "",
          company: p.company || "",
          website: p.website || "",
          linkedin: p.linkedin || "",
          xProfile: p.xProfile || "",
          availableForWork: p.availableForWork,
          image: p.image,
        });
      } catch {
        if (!cancelled) setError("Could not load profile.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  function addSkill(raw?: string) {
    const value = (raw ?? skillDraft).trim();
    if (!value) return;
    setForm((f) => {
      if (f.skills.includes(value) || f.skills.length >= 24) return f;
      return { ...f, skills: [...f.skills, value.slice(0, 40)] };
    });
    setSkillDraft("");
  }

  function onSkillKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addSkill();
    }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setOk("");
    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          username: form.username,
          headline: form.headline,
          bio: form.bio,
          skills: form.skills,
          location: form.location,
          company: form.company,
          website: form.website,
          linkedin: form.linkedin,
          xProfile: form.xProfile,
          availableForWork: form.availableForWork,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Save failed.");
        setSaving(false);
        return;
      }
      const p = data.profile as PublicProfile;
      setForm((f) => ({
        ...f,
        name: p.name,
        username: p.username || "",
        headline: p.headline,
        bio: p.bio,
        skills: p.skills,
        location: p.location,
        company: p.company,
        website: p.website,
        linkedin: p.linkedin,
        xProfile: p.xProfile,
        availableForWork: p.availableForWork,
        image: p.image,
      }));
      setOk("Profile saved.");
    } catch {
      setError("Something went wrong.");
    }
    setSaving(false);
  }

  if (loading) {
    return (
      <p className="py-16 text-center text-sm text-ink-muted">Loading profile…</p>
    );
  }

  const publicUrl = form.username ? `/u/${form.username}` : null;

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <div className="flex flex-wrap items-center gap-4 border-b border-white/10 pb-8">
        <div className="relative h-16 w-16 overflow-hidden rounded-full border border-white/15 bg-[#161b22]">
          {form.image ? (
            <Image
              src={form.image}
              alt=""
              width={64}
              height={64}
              className="h-full w-full object-cover"
              unoptimized
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center font-display text-xl text-accent">
              {(form.name || "?").slice(0, 1).toUpperCase()}
            </span>
          )}
        </div>
        <div className="min-w-0">
          <p className="font-display text-lg font-semibold text-snow">
            {form.name || "Your profile"}
          </p>
          <p className="text-sm text-ink-muted">{email}</p>
          {publicUrl ? (
            <Link
              href={publicUrl}
              className="mt-1 inline-block text-sm text-accent hover:underline"
            >
              View public profile →
            </Link>
          ) : (
            <p className="mt-1 text-xs text-ink-muted">
              Set a username to get a public profile URL.
            </p>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <label className="block md:col-span-1">
          <span className="text-sm text-ink-muted">Display name</span>
          <input
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className={inputClass}
          />
        </label>
        <label className="block">
          <span className="text-sm text-ink-muted">Username</span>
          <div className="mt-2 flex items-center rounded-md border border-white/10 bg-[#010409] focus-within:border-accent">
            <span className="pl-3 text-sm text-ink-muted">/u/</span>
            <input
              value={form.username}
              onChange={(e) =>
                setForm({
                  ...form,
                  username: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""),
                })
              }
              placeholder="yourname"
              className="w-full bg-transparent px-2 py-2.5 text-snow outline-none"
            />
          </div>
        </label>
        <label className="block md:col-span-2">
          <span className="text-sm text-ink-muted">Headline</span>
          <input
            value={form.headline}
            onChange={(e) => setForm({ ...form, headline: e.target.value })}
            placeholder="SEO specialist · Next.js developer"
            maxLength={120}
            className={inputClass}
          />
        </label>
        <label className="block md:col-span-2">
          <span className="text-sm text-ink-muted">About</span>
          <textarea
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
            rows={5}
            maxLength={2000}
            placeholder="Who you are, what you build, niches you focus on…"
            className={inputClass}
          />
        </label>
        <label className="block">
          <span className="text-sm text-ink-muted">Location</span>
          <input
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            placeholder="Gilgit, Pakistan"
            className={inputClass}
          />
        </label>
        <label className="block">
          <span className="text-sm text-ink-muted">Company</span>
          <input
            value={form.company}
            onChange={(e) => setForm({ ...form, company: e.target.value })}
            placeholder="SkillStack"
            className={inputClass}
          />
        </label>
        <label className="block">
          <span className="text-sm text-ink-muted">Website</span>
          <input
            value={form.website}
            onChange={(e) => setForm({ ...form, website: e.target.value })}
            placeholder="https://"
            className={inputClass}
          />
        </label>
        <label className="block">
          <span className="text-sm text-ink-muted">LinkedIn</span>
          <input
            value={form.linkedin}
            onChange={(e) => setForm({ ...form, linkedin: e.target.value })}
            placeholder="https://linkedin.com/in/…"
            className={inputClass}
          />
        </label>
        <label className="block md:col-span-2">
          <span className="text-sm text-ink-muted">X / Twitter</span>
          <input
            value={form.xProfile}
            onChange={(e) => setForm({ ...form, xProfile: e.target.value })}
            placeholder="https://x.com/…"
            className={inputClass}
          />
        </label>
      </div>

      <div>
        <span className="text-sm text-ink-muted">Skills</span>
        <div className="mt-2 flex flex-wrap gap-2">
          {form.skills.map((skill) => (
            <button
              key={skill}
              type="button"
              onClick={() =>
                setForm((f) => ({
                  ...f,
                  skills: f.skills.filter((s) => s !== skill),
                }))
              }
              className="rounded-md border border-accent/30 bg-accent/10 px-2.5 py-1 text-xs text-accent hover:border-accent/60"
              title="Remove"
            >
              {skill} ×
            </button>
          ))}
        </div>
        <div className="mt-3 flex gap-2">
          <input
            value={skillDraft}
            onChange={(e) => setSkillDraft(e.target.value)}
            onKeyDown={onSkillKey}
            placeholder="Add a skill and press Enter"
            className="flex-1 rounded-md border border-white/10 bg-[#010409] px-3 py-2.5 text-snow outline-none focus:border-accent"
          />
          <button
            type="button"
            onClick={() => addSkill()}
            className="rounded-md border border-white/20 px-4 py-2 text-sm text-snow hover:bg-white/5"
          >
            Add
          </button>
        </div>
      </div>

      <label className="flex cursor-pointer items-center gap-3">
        <input
          type="checkbox"
          checked={form.availableForWork}
          onChange={(e) =>
            setForm({ ...form, availableForWork: e.target.checked })
          }
          className="h-4 w-4 rounded border-white/20 bg-[#010409] accent-[#2cd4bf]"
        />
        <span className="text-sm text-snow">
          Available for projects / open to work
        </span>
      </label>

      {error ? <p className="text-sm text-red-300">{error}</p> : null}
      {ok ? <p className="text-sm text-accent">{ok}</p> : null}

      <button
        type="submit"
        disabled={saving}
        className="rounded-md bg-accent px-6 py-3 text-sm font-semibold text-[#010409] hover:bg-accent-deep disabled:opacity-60"
      >
        {saving ? "Saving…" : "Save profile"}
      </button>
    </form>
  );
}
