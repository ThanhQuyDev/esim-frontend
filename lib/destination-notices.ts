/**
 * Destination-specific warnings on the product page (#060).
 *
 * Turkey only, for now: an eSIM for Turkey has to be installed before the trip
 * — once there, downloading and installing the eSIM profile can be blocked,
 * leaving the traveller with no way to get online to set it up.
 */

export interface InstallBeforeTripNotice {
  title: string;
  body: string;
}

/** Country codes whose eSIM must be installed before leaving. */
export const INSTALL_BEFORE_TRIP_COUNTRIES = ["TR"] as const;

/** Slugs as a fallback, for a destination loaded without its country code. */
const INSTALL_BEFORE_TRIP_SLUGS = ["esim-tho-nhi-ky", "turkey", "tho-nhi-ky"];

export function requiresInstallBeforeTrip(
  destination:
    | { countryCode?: string | null; slug?: string | null; slugVi?: string | null }
    | null
    | undefined
): boolean {
  if (!destination) return false;
  const code = destination.countryCode?.trim().toUpperCase();
  if (code) return (INSTALL_BEFORE_TRIP_COUNTRIES as readonly string[]).includes(code);
  return [destination.slug, destination.slugVi].some((slug) =>
    INSTALL_BEFORE_TRIP_SLUGS.includes((slug ?? "").trim().toLowerCase().replace(/^\/+|\/+$/g, ""))
  );
}

export function installBeforeTripNotice(lang: string): InstallBeforeTripNotice {
  if (lang === "vi") {
    return {
      title: "Cài đặt eSIM trước chuyến đi",
      body: "Với eSIM Thổ Nhĩ Kỳ, bạn cần cài đặt eSIM khi còn ở Việt Nam (có Wi-Fi hoặc 4G), trước khi khởi hành. Tại Thổ Nhĩ Kỳ, việc tải và cài đặt eSIM có thể bị chặn nên bạn sẽ không kích hoạt được. Khi đến nơi, chỉ cần bật eSIM và chuyển vùng dữ liệu.",
    };
  }
  return {
    title: "Install your eSIM before you travel",
    body: "A Turkey eSIM must be installed before you leave, while you still have Wi-Fi or mobile data. In Turkey, downloading and installing an eSIM can be blocked, so it may not be possible to set it up there. When you arrive, just turn the eSIM on and enable data roaming.",
  };
}
