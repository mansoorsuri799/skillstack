export type TeamExpert = {
  id: string;
  name: string;
  role: string;
  specialty: string;
  bio: string;
  status: "online" | "away";
  initials: string;
  tone: string;
};

export const teamExperts: TeamExpert[] = [
  {
    id: "mansoor-khan",
    name: "Mansoor Khan",
    role: "CEO · SEO strategy",
    specialty: "SEO, AEO, growth",
    bio: "Founder of SkillStack. Talk strategy, packages, and how we rank in Gilgit-Baltistan and Pakistan.",
    status: "online",
    initials: "MK",
    tone: "from-emerald-600 to-teal-700",
  },
  {
    id: "web-dev",
    name: "Ayesha Karim",
    role: "Web developer",
    specialty: "WordPress & Next.js",
    bio: "Builds fast, mobile-first sites with Core Web Vitals, schema, and clean CMS setups.",
    status: "online",
    initials: "AK",
    tone: "from-sky-600 to-indigo-700",
  },
  {
    id: "content-writer",
    name: "Hassan Raza",
    role: "Content writer",
    specialty: "SEO blogging & AEO copy",
    bio: "Writes on-intent articles, FAQs, and speakable summaries built for Google and AI citations.",
    status: "online",
    initials: "HR",
    tone: "from-amber-600 to-orange-700",
  },
  {
    id: "seo-expert",
    name: "Sara Malik",
    role: "SEO expert",
    specialty: "Rankings & keyword clusters",
    bio: "Maps keywords, competitor gaps, and on-page structure so pages can rank and get cited.",
    status: "away",
    initials: "SM",
    tone: "from-violet-600 to-fuchsia-700",
  },
  {
    id: "backlinks",
    name: "Bilal Ahmed",
    role: "Authority specialist",
    specialty: "Backlinks & citations",
    bio: "Handles high-authority placements, brand mentions, and AI trust signals — no spam.",
    status: "online",
    initials: "BA",
    tone: "from-rose-600 to-red-800",
  },
  {
    id: "technical-seo",
    name: "Noor Fatima",
    role: "Technical SEO",
    specialty: "CWV, crawl, schema",
    bio: "Audits indexation, Core Web Vitals, and entity-rich structured data for AI Overview eligibility.",
    status: "online",
    initials: "NF",
    tone: "from-cyan-600 to-teal-800",
  },
];

export function getExpertById(id: string) {
  return teamExperts.find((e) => e.id === id);
}

export function expertReply(expert: TeamExpert, userText: string): string {
  const snippet = userText.trim().slice(0, 80);
  const openers: Record<string, string> = {
    "mansoor-khan": `Thanks for writing in. I read your note${snippet ? ` about “${snippet}${userText.length > 80 ? "…" : ""}”` : ""}. Tell me your niche, target country, and whether you need a keyword package, a full site, or ranking support — I’ll point you to the right SkillStack path.`,
    "web-dev": `Got it. For the build I’ll need: WordPress or Next.js, must-have pages, and whether we should wire schema / AEO from day one. Share a reference URL if you have one and I’ll outline the first sprint.`,
    "content-writer": `I can draft this. Send the primary keyword, audience (Pakistan / international), and tone. I’ll come back with a brief: H1, FAQ angles, and an AEO-ready outline before we write the full piece.`,
    "seo-expert": `Noted. I’ll treat this as a ranking brief. Share 2–3 competitor URLs and the country you want to rank in. I’ll reply with difficulty notes and a cluster (pillar + supporting articles).`,
    "backlinks": `Understood. We only place links after Search Console shows which URLs deserve authority. Send your domain (or say if it’s new) and I’ll explain the sequence: foundational → editorial citations — no spam.`,
    "technical-seo": `I’ll look at this as a technical pass. If you have a live URL, paste it. I’ll check crawl, Core Web Vitals, and schema gaps and send a P0 / P1 fix list.`,
  };
  return (
    openers[expert.id] ??
    `Thanks — a SkillStack specialist will continue this thread. Meanwhile, share your website URL and goal (rank, build, or content) so we can move faster.`
  );
}
