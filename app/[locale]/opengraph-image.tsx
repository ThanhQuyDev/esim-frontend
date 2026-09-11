import { ImageResponse } from "next/og";

/**
 * Default social-share image for every page (#L010).
 *
 * Pages set `openGraph` without images unless an admin uploaded one in the SEO
 * config, so shared links rendered text-only on Facebook/Zalo/Messenger.
 * File-based metadata takes priority, so this fills the gap site-wide while a
 * CMS-provided `ogImage` still wins where set.
 *
 * ASCII-only text: the bundled default font has no Vietnamese diacritics.
 */
export const runtime = "edge";
export const alt = "esim.vn - Travel eSIM for 250+ destinations";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "#FFF500",
          color: "#111111",
        }}
      >
        <div style={{ fontSize: 132, fontWeight: 800, letterSpacing: -4 }}>esim.vn</div>
        <div style={{ fontSize: 52, marginTop: 24 }}>Travel eSIM for 250+ destinations</div>
        <div style={{ fontSize: 36, marginTop: 16, opacity: 0.7 }}>
          Instant QR delivery - 4G/5G data - No roaming fees
        </div>
      </div>
    ),
    { ...size }
  );
}
