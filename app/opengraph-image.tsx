import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Okelcor – Premium Tyre Sourcing";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "flex-end",
          backgroundColor: "#171a20",
          padding: "72px 80px",
          fontFamily: "Helvetica, Arial, sans-serif",
          position: "relative",
        }}
      >
        {/* Orange accent bar */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "6px",
            backgroundColor: "#f4511e",
          }}
        />

        {/* Decorative circle */}
        <div
          style={{
            position: "absolute",
            top: "-120px",
            right: "-120px",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            border: "2px solid rgba(244,81,30,0.18)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "-60px",
            right: "-60px",
            width: "340px",
            height: "340px",
            borderRadius: "50%",
            border: "2px solid rgba(244,81,30,0.10)",
          }}
        />

        {/* Eyebrow */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginBottom: "28px",
          }}
        >
          <div
            style={{
              width: "28px",
              height: "4px",
              backgroundColor: "#f4511e",
              borderRadius: "2px",
            }}
          />
          <span
            style={{
              fontSize: "16px",
              fontWeight: 700,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "#f4511e",
            }}
          >
            Growing Together
          </span>
        </div>

        {/* Main title */}
        <div
          style={{
            fontSize: "72px",
            fontWeight: 800,
            color: "#ffffff",
            lineHeight: 0.95,
            letterSpacing: "-0.03em",
            marginBottom: "28px",
            maxWidth: "820px",
          }}
        >
          Okelcor
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: "26px",
            fontWeight: 400,
            color: "rgba(255,255,255,0.62)",
            lineHeight: 1.4,
            maxWidth: "680px",
            marginBottom: "52px",
          }}
        >
          Premium tyre sourcing for distributors and wholesalers worldwide.
        </div>

        {/* Bottom meta row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "32px",
          }}
        >
          {["PCR Tyres", "TBR Tyres", "Used Tyres", "Global Logistics"].map(
            (label) => (
              <div
                key={label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontSize: "15px",
                  fontWeight: 600,
                  color: "rgba(255,255,255,0.50)",
                  letterSpacing: "0.04em",
                }}
              >
                <div
                  style={{
                    width: "5px",
                    height: "5px",
                    borderRadius: "50%",
                    backgroundColor: "#f4511e",
                  }}
                />
                {label}
              </div>
            )
          )}
        </div>

        {/* Domain */}
        <div
          style={{
            position: "absolute",
            bottom: "40px",
            right: "80px",
            fontSize: "16px",
            fontWeight: 500,
            color: "rgba(255,255,255,0.28)",
            letterSpacing: "0.04em",
          }}
        >
          okelcor.com
        </div>
      </div>
    ),
    { ...size }
  );
}
