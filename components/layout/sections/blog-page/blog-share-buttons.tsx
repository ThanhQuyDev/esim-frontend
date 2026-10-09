"use client";

import { useState } from "react";

/**
 * Share the article (#034, test round 4): coloured X, TikTok, Facebook and
 * Instagram buttons plus "copy link". The icons used to be fixed links to the
 * company's own social profiles, so clicking one never shared the post.
 *
 * X and Facebook have a web share URL. TikTok and Instagram do not, so they open
 * the device share sheet where there is one (phones) and otherwise copy the
 * link, saying where to paste it.
 */

type Network = "x" | "tiktok" | "facebook" | "instagram" | "copy";

const ICONS: Record<Network, { label: string; bg: string; path: React.ReactNode }> = {
  x: {
    label: "X",
    bg: "#000000",
    path: (
      <path
        fill="#fff"
        d="M17.75 3h3.07l-6.7 7.66L22 21h-6.17l-4.83-6.32L5.47 21H2.4l7.17-8.2L2 3h6.33l4.37 5.77L17.75 3Zm-1.08 16.17h1.7L7.4 4.74H5.58l11.09 14.43Z"
      />
    ),
  },
  tiktok: {
    label: "TikTok",
    bg: "#010101",
    path: (
      <>
        <path
          fill="#25F4EE"
          d="M15.6 3.5c.3 2.1 1.5 3.6 3.6 3.8v2.4c-1.3.1-2.5-.3-3.6-1v5.6c0 3.6-3.9 5.8-7 4-2.9-1.7-2.9-6.1.3-7.5.7-.3 1.5-.4 2.3-.3v2.6c-.3-.1-.7-.1-1-.1-1.9.3-2.2 3-.4 3.6 1.3.5 2.8-.5 2.8-2V3.5h3Z"
        />
        <path
          fill="#FE2C55"
          d="M16.4 4.3c.3 2.1 1.5 3.6 3.6 3.8v2.4c-1.3.1-2.5-.3-3.6-1v5.6c0 3.6-3.9 5.8-7 4-.3-.2-.6-.4-.8-.6 3 1.3 6.6-.8 6.6-4.2V8.7c1.1.7 2.3 1.1 3.6 1V7.3c-.9-.1-1.7-.5-2.3-1.1l-.1-1.9Z"
        />
        <path
          fill="#fff"
          d="M15.6 8.7c1.1.7 2.3 1.1 3.6 1V7.3c-1.5-.3-2.6-1.4-3.1-2.9h-1.3v11.2c0 1.5-1.5 2.5-2.8 2-.9-.3-1.3-1.2-1.1-2-1.1.5-1.3 2.4.2 2.9 1.3.5 2.8-.5 2.8-2V3.5"
        />
      </>
    ),
  },
  facebook: {
    label: "Facebook",
    bg: "#1877F2",
    path: (
      <path
        fill="#fff"
        d="M13.4 21v-7.6h2.6l.4-3h-3V8.5c0-.9.3-1.5 1.5-1.5h1.6V4.3c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4v2.2H7.7v3h2.6V21h3.1Z"
      />
    ),
  },
  instagram: {
    label: "Instagram",
    bg: "linear-gradient(45deg,#FEDA75 0%,#FA7E1E 25%,#D62976 50%,#962FBF 75%,#4F5BD5 100%)",
    path: (
      <>
        <rect x="4.5" y="4.5" width="15" height="15" rx="4.5" fill="none" stroke="#fff" strokeWidth="1.8" />
        <circle cx="12" cy="12" r="3.6" fill="none" stroke="#fff" strokeWidth="1.8" />
        <circle cx="16.6" cy="7.4" r="1.1" fill="#fff" />
      </>
    ),
  },
  copy: {
    label: "Copy link",
    bg: "#6B7280",
    path: (
      <path
        fill="none"
        stroke="#fff"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"
      />
    ),
  },
};

const ORDER: Network[] = ["x", "tiktok", "facebook", "instagram", "copy"];

/** Web share URL for a network, or null when it has none (TikTok, Instagram). */
export function shareUrl(network: Network, url: string, title: string): string | null {
  const u = encodeURIComponent(url);
  if (network === "x") return `https://twitter.com/intent/tweet?url=${u}&text=${encodeURIComponent(title)}`;
  if (network === "facebook") return `https://www.facebook.com/sharer/sharer.php?u=${u}`;
  return null;
}

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export function BlogShareButtons({
  title,
  lang,
  direction = "row",
  className = "",
}: {
  title: string;
  lang: string;
  direction?: "row" | "col";
  className?: string;
}) {
  const vi = lang === "vi";
  const [notice, setNotice] = useState<string | null>(null);

  const flash = (text: string) => {
    setNotice(text);
    window.setTimeout(() => setNotice(null), 2500);
  };

  const share = async (network: Network) => {
    const url = window.location.href.split("#")[0];
    const web = shareUrl(network, url, title);
    if (web) {
      window.open(web, "_blank", "noopener,noreferrer,width=640,height=560");
      return;
    }
    if (network !== "copy" && typeof navigator.share === "function") {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        // Cancelled or unsupported: fall back to copying the link.
      }
    }
    const ok = await copyText(url);
    if (!ok) return flash(vi ? "Không copy được link" : "Could not copy the link");
    if (network === "copy") return flash(vi ? "Đã copy link bài viết" : "Link copied");
    const app = ICONS[network].label;
    flash(vi ? `Đã copy link — dán vào ${app} để chia sẻ` : `Link copied — paste it in ${app} to share`);
  };

  return (
    <div
      className={`relative flex ${direction === "col" ? "flex-col" : "flex-row"} items-center gap-3 ${className}`}
      data-testid="blog-share-buttons"
    >
      {ORDER.map((network) => {
        const icon = ICONS[network];
        const label =
          network === "copy"
            ? vi
              ? "Copy link bài viết"
              : "Copy article link"
            : vi
              ? `Chia sẻ lên ${icon.label}`
              : `Share on ${icon.label}`;
        return (
          <button
            key={network}
            type="button"
            onClick={() => share(network)}
            aria-label={label}
            title={label}
            data-testid={`blog-share-${network}`}
            className="flex h-8 w-8 items-center justify-center rounded-full transition-transform hover:scale-110 focus-visible:outline-hidden focus-visible:shadow-focus"
            style={{ background: icon.bg }}
          >
            <svg viewBox="0 0 24 24" width={18} height={18} aria-hidden>
              {icon.path}
            </svg>
          </button>
        );
      })}
      {notice && (
        <span
          role="status"
          data-testid="blog-share-notice"
          className={`absolute z-10 whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-xs text-white ${
            direction === "col" ? "right-full mr-2 top-0" : "left-0 top-full mt-2"
          }`}
        >
          {notice}
        </span>
      )}
    </div>
  );
}
