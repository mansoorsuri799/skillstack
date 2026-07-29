import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#ffffff",
          borderRadius: 36,
        }}
      >
        <div
          style={{
            fontSize: 96,
            fontWeight: 700,
            color: "#010409",
            letterSpacing: "-0.04em",
          }}
        >
          S
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 28,
            right: 28,
            width: 22,
            height: 22,
            borderRadius: 999,
            background: "#2dd4bf",
          }}
        />
      </div>
    ),
    { ...size },
  );
}
