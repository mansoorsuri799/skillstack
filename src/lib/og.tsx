import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const OG_SIZE = { width: 1200, height: 630 } as const;
export const OG_CONTENT_TYPE = "image/png";

export type FeatureOgProps = {
  title: string;
  /** Small label above the title, e.g. "Service" or "About" */
  eyebrow?: string;
  subtitle?: string;
};

async function loadBrandIconDataUrl() {
  const path = join(process.cwd(), "public/brand/skill-stack-email.png");
  const bytes = await readFile(path);
  return `data:image/png;base64,${bytes.toString("base64")}`;
}

/** Branded 1200×630 feature / Open Graph image for social + Google previews. */
export async function createFeatureOgImage({
  title,
  eyebrow = "SkillStack",
  subtitle = "Web development, SEO & ranking for Pakistan and the world",
}: FeatureOgProps) {
  const icon = await loadBrandIconDataUrl();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#010409",
          padding: "56px 64px",
          fontFamily: "system-ui, sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Atmosphere */}
        <div
          style={{
            position: "absolute",
            top: -120,
            right: -80,
            width: 480,
            height: 480,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(45,212,191,0.22) 0%, transparent 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -160,
            left: -100,
            width: 520,
            height: 520,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(20,184,166,0.16) 0%, transparent 70%)",
          }}
        />

        {/* Brand row */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={icon}
            width={56}
            height={56}
            alt=""
            style={{ borderRadius: 12 }}
          />
          <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
            <span
              style={{
                color: "#f0f6fc",
                fontSize: 32,
                fontWeight: 700,
                letterSpacing: "-0.02em",
              }}
            >
              SkillStack
            </span>
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "#2dd4bf",
                marginBottom: 4,
              }}
            />
          </div>
        </div>

        {/* Title block */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 18,
            maxWidth: 980,
            marginTop: 24,
          }}
        >
          <span
            style={{
              color: "#2dd4bf",
              fontSize: 22,
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            {eyebrow}
          </span>
          <span
            style={{
              color: "#ffffff",
              fontSize: title.length > 48 ? 52 : 64,
              fontWeight: 700,
              lineHeight: 1.12,
              letterSpacing: "-0.03em",
            }}
          >
            {title}
          </span>
          {subtitle ? (
            <span
              style={{
                color: "#8b949e",
                fontSize: 26,
                lineHeight: 1.4,
                maxWidth: 900,
              }}
            >
              {subtitle}
            </span>
          ) : null}
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
          }}
        >
          <span style={{ color: "#8b949e", fontSize: 22 }}>
            skillstack.com.pk
          </span>
          <span style={{ color: "#2dd4bf", fontSize: 20, fontWeight: 500 }}>
            SMC-Private Limited
          </span>
        </div>
      </div>
    ),
    { ...OG_SIZE },
  );
}
