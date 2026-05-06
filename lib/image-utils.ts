export interface CloudinaryTransformOptions {
  width: number;
  height?: number;
  quality?: number | "auto" | "auto:eco" | "auto:good";
  crop?: "fill" | "fit" | "limit" | "scale";
  gravity?: string;
}

export function getCloudinaryTransformedUrl(
  src: string | null | undefined,
  options: CloudinaryTransformOptions
): string | undefined {
  if (!src) return undefined;

  try {
    const url = new URL(src);
    if (url.hostname !== "res.cloudinary.com") return src;

    const uploadMarker = "/image/upload/";
    const markerIndex = url.pathname.indexOf(uploadMarker);
    if (markerIndex === -1) return src;

    const quality = options.quality ?? "auto:eco";
    const transformationParts = [
      "f_auto",
      typeof quality === "number" ? `q_${quality}` : `q_${quality}`,
      `c_${options.crop ?? "fill"}`,
      `w_${options.width}`,
    ];

    if (options.height) transformationParts.push(`h_${options.height}`);
    if (options.gravity) transformationParts.push(`g_${options.gravity}`);

    const beforeUpload = url.pathname.slice(0, markerIndex + uploadMarker.length);
    const afterUpload = url.pathname.slice(markerIndex + uploadMarker.length);
    const firstSegment = afterUpload.split("/")[0] ?? "";

    // Avoid stacking transformations if CMS already stores a transformed Cloudinary URL.
    if (firstSegment.includes(",") || firstSegment.startsWith("f_")) {
      return src;
    }

    url.pathname = `${beforeUpload}${transformationParts.join(",")}/${afterUpload}`;
    return url.toString();
  } catch {
    return src;
  }
}
