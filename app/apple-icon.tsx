import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#171a20",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 36,
        }}
      >
        {/* Tyre outer ring */}
        <div
          style={{
            width: 130,
            height: 130,
            borderRadius: "50%",
            border: "22px solid #f4511e",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* Wheel hub */}
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              background: "#f4511e",
            }}
          />
        </div>
      </div>
    ),
    { ...size }
  );
}
