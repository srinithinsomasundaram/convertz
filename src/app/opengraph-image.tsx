import { ImageResponse } from "next/og";

export const size = {
  width: 1200,
  height: 630,
};

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
          background:
            "radial-gradient(circle at top left, #38bdf8 0%, #0f172a 45%, #020617 100%)",
          color: "#ffffff",
          padding: "64px",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "20px",
          }}
        >
          <div
            style={{
              width: "76px",
              height: "76px",
              borderRadius: "24px",
              background: "#0f172a",
              border: "1px solid rgba(255,255,255,0.18)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg
              width="38"
              height="38"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="1.9"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5.75 8.25h7.5" />
              <path d="m11.75 5.75 5 2.5-5 2.5" />
              <path d="M18.25 15.75h-7.5" />
              <path d="m12.25 13.25-5 2.5 5 2.5" />
            </svg>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 44, fontWeight: 800 }}>Convertz</div>
            <div style={{ fontSize: 20, color: "rgba(255,255,255,0.72)" }}>
              By YESP Studio
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "900px" }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              fontSize: 72,
              lineHeight: 1.05,
              fontWeight: 900,
            }}
          >
            <span>Online File Conversion</span>
            <span>That Stays Easy</span>
          </div>
          <div style={{ fontSize: 28, lineHeight: 1.4, color: "rgba(255,255,255,0.82)" }}>
            Convert PDF, Word, Excel, images, and media files with fast local-first tools.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: "16px",
            fontSize: 24,
            color: "rgba(255,255,255,0.86)",
          }}
        >
          <div
            style={{
              padding: "12px 18px",
              borderRadius: "999px",
              background: "rgba(255,255,255,0.08)",
            }}
          >
            PDF To Word
          </div>
          <div
            style={{
              padding: "12px 18px",
              borderRadius: "999px",
              background: "rgba(255,255,255,0.08)",
            }}
          >
            Merge PDF
          </div>
          <div
            style={{
              padding: "12px 18px",
              borderRadius: "999px",
              background: "rgba(255,255,255,0.08)",
            }}
          >
            Compress PDF
          </div>
        </div>
      </div>
    ),
    size,
  );
}
