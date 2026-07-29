import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#010409",
        }}
      >
        {/* Simplified isometric stack for favicon */}
        <div
          style={{
            display: "flex",
            position: "relative",
            width: 48,
            height: 48,
          }}
        >
          {/* Bottom */}
          <div
            style={{
              position: "absolute",
              left: 6,
              top: 28,
              width: 36,
              height: 12,
              background: "#4A5568",
              transform: "skewX(-28deg)",
              borderRadius: 2,
            }}
          />
          {/* Middle */}
          <div
            style={{
              position: "absolute",
              left: 6,
              top: 18,
              width: 36,
              height: 12,
              background: "#0F766E",
              transform: "skewX(-28deg)",
              borderRadius: 2,
            }}
          />
          {/* Top */}
          <div
            style={{
              position: "absolute",
              left: 6,
              top: 8,
              width: 36,
              height: 12,
              background: "#2DD4BF",
              transform: "skewX(-28deg)",
              borderRadius: 2,
            }}
          />
          {/* Dot */}
          <div
            style={{
              position: "absolute",
              left: 40,
              top: 6,
              width: 7,
              height: 7,
              borderRadius: 999,
              background: "#F0F3F6",
            }}
          />
        </div>
      </div>
    ),
    { ...size },
  );
}
