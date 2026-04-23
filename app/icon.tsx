import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
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
        }}
      >
        {/* Tyre outer ring */}
        <div
          style={{
            width: 24,
            height: 24,
            borderRadius: "50%",
            border: "4px solid #f4511e",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* Wheel hub */}
          <div
            style={{
              width: 8,
              height: 8,
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
