import { ImageResponse } from "next/og";

export const alt = "EARTH SP NDA - Tactical Defence Exam Prep";
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export function generateShareImage(title?: string, description?: string) {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          backgroundColor: "#090d16",
          padding: "80px",
          color: "#f1f5f9",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "24px",
          }}
        >
          <div
            style={{
              width: "16px",
              height: "16px",
              borderRadius: "50%",
              backgroundColor: "#facc15",
            }}
          />
          <span
            style={{
              fontSize: "20px",
              fontWeight: 600,
              letterSpacing: "0.1em",
              color: "#fde047",
              textTransform: "uppercase",
            }}
          >
            EARTH SP NDA
          </span>
        </div>
        <h1
          style={{
            fontSize: "56px",
            fontWeight: 700,
            color: "#ffffff",
            lineHeight: 1.15,
            marginBottom: "20px",
            maxWidth: "900px",
          }}
        >
          {title || "Master the NDA Exam with Tactical Precision"}
        </h1>
        <p
          style={{
            fontSize: "24px",
            color: "#94a3b8",
            lineHeight: 1.4,
            maxWidth: "800px",
          }}
        >
          {description ||
            "Enterprise-grade study tracking, interactive mock papers, and real-time performance analytics."}
        </p>
      </div>
    ),
    {
      ...size,
    }
  );
}

export function ShareImage(props?: { title?: string; description?: string }) {
  return generateShareImage(props?.title, props?.description);
}

export default ShareImage;