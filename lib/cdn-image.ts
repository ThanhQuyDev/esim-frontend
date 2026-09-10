/**
 * Cloudinary delivery tuning (#092).
 *
 * The hero is the page's LCP element and it is fetched as a raw PNG straight
 * from Cloudinary — full size, no compression hints, no modern format. The
 * same URL with `f_auto,q_auto` in it comes back as WebP/AVIF at a sensible
 * quality to browsers that support them, which is the single biggest byte
 * saving available on the landing page and exactly what Lighthouse asks for
 * under "Serve images in next-gen formats" and "Efficiently encode images".
 *
 * The URL shape is `<host>/<cloud>/image/upload/<transformations?>/<path>`, so
 * the transformation slots in right after `/upload/`.
 */

const CLOUDINARY_UPLOAD = "/image/upload/";

/** Transformations we always want: modern format, automatic quality. */
const AUTO_TRANSFORM = "f_auto,q_auto";

export function isCloudinaryUrl(url: string | null | undefined): boolean {
  return !!url && url.includes("res.cloudinary.com") && url.includes(CLOUDINARY_UPLOAD);
}

/**
 * Whether this URL already carries a transformation segment.
 *
 * The segment right after `/upload/` is a transformation when it contains
 * Cloudinary's `key_value` syntax; a bare `v1234567` is a version, and
 * anything else is the asset path.
 */
function hasTransform(afterUpload: string): boolean {
  const first = afterUpload.split("/")[0] ?? "";
  return /(^|,)[a-z]+_[^,/]+/.test(first) && !/^v\d+$/.test(first);
}

/**
 * Add `f_auto,q_auto` (and optionally a width cap) to a Cloudinary URL.
 *
 * Anything that is not a Cloudinary upload URL is returned untouched — the
 * hero can be pointed at any host from the CMS, and a foreign URL must not be
 * mangled into a broken one.
 */
export function optimizeCloudinary(
  url: string | null | undefined,
  options: { width?: number } = {}
): string {
  if (!url) return "";
  if (!isCloudinaryUrl(url)) return url;

  const [prefix, rest] = url.split(CLOUDINARY_UPLOAD);
  if (!rest) return url;

  const parts = [AUTO_TRANSFORM];
  if (options.width && options.width > 0) {
    // `c_limit` never upscales: a smaller original is served as-is.
    parts.push(`w_${Math.round(options.width)}`, "c_limit");
  }

  // Already tuned (an admin pasted a transformed URL): leave it alone rather
  // than stacking a second transformation on top.
  if (hasTransform(rest)) return url;

  return `${prefix}${CLOUDINARY_UPLOAD}${parts.join(",")}/${rest}`;
}
