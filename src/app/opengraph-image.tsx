import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "SkillStack — Web development & SEO";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
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
          padding: "64px 72px",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse 70% 60% at 85% 15%, rgba(45,212,191,0.22), transparent 55%), radial-gradient(ellipse 50% 40% at 10% 90%, rgba(56,100,140,0.18), transparent 50%)",
          }}
        />
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 10,
              background: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#010409",
              fontSize: 28,
              fontWeight: 700,
            }}
          >
            S
          </div>
          <span
            style={{
              fontSize: 36,
              fontWeight: 700,
              color: "#f0f3f6",
              letterSpacing: "-0.03em",
            }}
          >
            SkillStack
            <span style={{ color: "#2dd4bf", fontSize: 18 }}>●</span>
          </span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div
            style={{
              fontSize: 64,
              fontWeight: 700,
              color: "#f0f3f6",
              lineHeight: 1.1,
              letterSpacing: "-0.03em",
              maxWidth: 900,
            }}
          >
            From keyword to the first page on Google
          </div>
          <div
            style={{
              fontSize: 28,
              color: "#8b949e",
              maxWidth: 720,
              lineHeight: 1.35,
            }}
          >
            Web development, SEO, and monetization for Pakistan and the world.
          </div>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            color: "#6e7681",
            fontSize: 22,
          }}
        >
          <span>skillstack.com.pk</span>
          <span style={{ color: "#2dd4bf" }}>smc-private limited</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
