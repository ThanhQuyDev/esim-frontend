"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname as useNextPathname } from "next/navigation";
import { usePathname as useIntlPathname, useRouter as useIntlRouter } from "@/i18n/navigation";
import {
  resolveDynamicLangSwitchPath,
  resolveLangSwitchPath,
  resolveLegalLangSwitchPath,
} from "@/i18n/lang-switch";
import * as Dialog from "@radix-ui/react-dialog";
import { cn } from "@/lib/utils";
import { SailyLogo } from "@/components/icons/saily-logo";
import { HelpCenterNavbar } from "@/components/layout/help-center-navbar";
import { DestinationDropdown } from "@/components/layout/destination-dropdown";
import { useAuth } from "@/lib/auth";
import { useCart, useTopDestinations, useSearchDestinations, useSearchRegions } from "@/lib/hooks";
import { useDebounce } from "@/lib/use-debounce";
import {
  ChevronDown,
  Search,
  X,
  Globe,
  UserPlus,
  Info,
  User,
  LogOut,
  ShoppingCart,
  Loader2,
  MapPin,
  ChevronRight,
} from "lucide-react";
import type { Locale } from "@/lib/i18n-config";
import { localizedHref } from "@/lib/route-mapping";
import {
  pickLocalizedTitle,
  resolveFileUrl,
  type TopBar,
} from "@/lib/api";

// Swiper
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay, EffectFade } from "swiper/modules";

/* ===== Types ===== */

interface NavbarProps {
  lang: Locale;
  dict: Record<string, any>;
  topBars?: TopBar[];
}

interface MenuLink {
  icon: string;
  title: string;
  desc: string;
  href: string;
}

interface ExploreCard {
  title: string;
  desc: string;
  href: string;
  image: string;
  imageAlt: string;
}

interface MenuBadge {
  text: string;
}

interface MegaMenuData {
  col1Label?: string;
  col1: (MenuLink & { badge?: string })[];
  col2Label?: string;
  col2: (MenuLink & { badge?: string })[];
  explore: ExploreCard[];
  bottomLeft: { icon: boolean; text: string; href: string };
  bottomRight: { text: string; href: string };
}

interface AnnouncementIconProps {
  iconUrl?: string | null;
  className?: string;
}

function AnnouncementIcon({ iconUrl, className }: AnnouncementIconProps) {
  const iconClassName = cn("w-4 h-4 shrink-0", className);

  if (iconUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        alt=""
        src={iconUrl}
        className={cn(iconClassName, "object-contain")}
        aria-hidden="true"
      />
    );
  }

  return (
    <UserPlus
      className={cn(iconClassName, "text-text-primary-on-color")}
      aria-hidden="true"
    />
  );
}

/* ===== Icon mapping (yellow circle icons) ===== */

const ICON_SVG: Record<string, string> = {
  "signs-post":
    "M3 3h8l2 2h6v4H3V3zm0 8h18v4H11l-2 2H3v-6z",
  pen: "M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z",
  "circle-user":
    "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 5a3 3 0 1 1 0 6 3 3 0 0 1 0-6zm-5.5 11.5a6.5 6.5 0 0 1 11 0",
  globe:
    "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 2a8 8 0 0 1 5.3 2H6.7A8 8 0 0 1 12 4zM4 12a8 8 0 0 1 .7-3.3h14.6A8 8 0 0 1 4 12z",
  "network-wired":
    "M12 2v6m0 0H6m6 0h6M6 8v4m12-4v4M2 12h4m12 0h4M6 16v4m12-4v4M2 16h8m4 0h8",
  "message-dots":
    "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z",
  seedling:
    "M12 22V12m0 0c0-4-3-7-7-7 0 4 3 7 7 7zm0 0c0-4 3-7 7-7 0 4-3 7-7 7z",
  gem: "M6 3h12l4 6-10 13L2 9l4-6z",
  briefcase:
    "M20 7h-4V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2H4a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2zM10 5h4v2h-4V5z",
  "shield-check":
    "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10zm-2-7l2 2 4-4",
  "mobile-check":
    "M7 2h10a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zm5 18h.01M9 12l2 2 4-4",
  calculator:
    "M4 2h16a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zm4 4h8v4H8V6zm0 8h2v2H8v-2zm6 0h2v2h-2v-2zm-6 4h2v2H8v-2zm6 0h2v2h-2v-2z",
  "thumbs-up":
    "M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3m7-2V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z",
  "badge-percent":
    "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2zM9 12l1.5 1.5L15 9",
  tag: "M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82zM7 7h.01",
  ticket:
    "M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v2z",
  "help-circle":
    "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 14h.01M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3",
  headset:
    "M3 18v-6a9 9 0 0 1 18 0v6M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z",
  "file-text":
    "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-2 0v6h6M16 13H8m8 4H8m2-8H8",
  "triangle-alert":
    "M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4m0 4h.01",
};

/* ===== Menu Data ===== */

function getMenuData(lang: Locale): Record<string, MegaMenuData> {
  const isVi = lang === "vi";

  return {
    product: {
      col1Label: isVi ? "Tính năng" : "Features",
      col1: [
        {
          icon: "globe",
          title: isVi ? "eSIM du lịch Việt Nam" : "eSIM for Vietnam Travel",
          desc: isVi
            ? "Gói dữ liệu eSIM cho khách du lịch tại Việt Nam."
            : "Data plans for travelers in Vietnam.",
          href: isVi ? '/esim-viet-nam' : `/${lang}/esim-viet-nam`,
        },
        {
          icon: "pen",
          title: isVi ? "Dành cho nhà sáng tạo" : "For Creators",
          desc: isVi
            ? "Giải pháp eSIM dành riêng cho nhà sáng tạo nội dung."
            : "eSIM solutions tailored for content creators.",
          href: localizedHref(lang, 'all-destinations'),
        },
      ],
      col2Label: isVi ? "Công cụ" : "Tools",
      col2: [
        {
          icon: "calculator",
          title: isVi ? "Công cụ tính toán lượng data" : "Data Usage Calculator",
          desc: isVi
            ? "Ước tính lượng dữ liệu bạn cần cho chuyến đi."
            : "Estimate the data you'll need for your trip.",
          href: localizedHref(lang, 'data-calculator'),
        },
        {
          icon: "mobile-check",
          title: isVi ? "Kiểm tra tương thích eSIM" : "eSIM Compatibility",
          desc: isVi
            ? "Kiểm tra thiết bị của bạn có hỗ trợ eSIM hay không."
            : "Check if your device supports eSIM.",
          href: localizedHref(lang, 'esim-supported-devices'),
        },
      ],
      explore: [
        {
          title: isVi ? "Tính năng bảo mật" : "Security features",
          desc: isVi
            ? "Khám phá tính năng bảo vệ kỹ thuật số của esim.vn."
            : "Discover esim.vn's built-in digital protection.",
          href: localizedHref(lang, 'all-destinations'),
          image:
            "https://sb.nordcdn.com/m/7bf573d226cb4b2d/original/mega-menu-explore-security-features.png",
          imageAlt: "A man uses esim.vn's built-in digital protection.",
        },
        {
          title: isVi ? "eSIM cho Doanh nghiệp" : "eSIM for Business",
          desc: isVi
            ? "Quản lý tất cả gói eSIM của đội nhóm."
            : "Manage all your team's eSIM plans.",
          href: localizedHref(lang, 'all-destinations'),
          image:
            "https://sb.nordcdn.com/m/37ec43195ff7cbbd/original/mega-menu-explore-b2b-admin-panel.png",
          imageAlt:
            "A smiling woman using her phone, which mirrors the esim.vn business dashboard.",
        },
        {
          title: "Ultra Plan",
          desc: isVi
            ? "Dữ liệu không giới hạn, hoàn 8% tín dụng và nhiều ưu đãi."
            : "Unlimited data, 8% back in credits, and extra perks.",
          href: localizedHref(lang, 'all-destinations'),
          image:
            "https://sb.nordcdn.com/m/681452996b3d756b/original/mega-menu-explore-ultra-plan.png",
          imageAlt: "The Ultra plan tab on the esim.vn app.",
        },
      ],
      bottomLeft: {
        icon: true,
        text: isVi ? "eSIM là gì?" : "What is an eSIM?",
        href: localizedHref(lang, 'what-is-esim'),
      },
      bottomRight: {
        text: isVi ? "Tất cả điểm đến" : "All destinations",
        href: localizedHref(lang, 'all-destinations'),
      },
    },
    resources: {
      col1: [
        {
          icon: "signs-post",
          title: isVi ? "eSIM là gì?" : "What is an eSIM?",
          desc: isVi
            ? "Tìm hiểu cách eSIM hoạt động và tại sao hữu ích."
            : "Discover how an eSIM works and why it's useful.",
          href: localizedHref(lang, 'what-is-esim'),
        },
        {
          icon: "pen",
          title: "Blog",
          desc: isVi
            ? "Đọc bài viết, hướng dẫn và cập nhật sản phẩm."
            : "Read articles, guides, and product updates.",
          href: localizedHref(lang, 'blog'),
        },
        {
          icon: "circle-user",
          title: isVi ? "Về chúng tôi" : "About Us",
          desc: isVi
            ? "Tìm hiểu thêm về chúng tôi."
            : "Learn more about who we are and what we do.",
          href: localizedHref(lang, 'about-us'),
        },
      ],
      col2: [
        {
          icon: "message-dots",
          title: isVi ? "Đánh giá về esim.vn" : "esim.vn Reviews",
          desc: isVi
            ? "Xem mọi người nói gì về chúng tôi!"
            : "Find out what people are saying about us!",
          href: localizedHref(lang, 'review'),
        },
        {
          icon: "globe",
          title: isVi ? "Khu vực Báo chí" : "Press Area",
          desc: isVi
            ? "Tin tức mới nhất và tài nguyên thương hiệu."
            : "The latest news, insights, and brand assets.",
          href: localizedHref(lang, 'press-area'),
        },
      ],
      explore: [
        {
          title: isVi ? "Tính năng bảo mật" : "Security features",
          desc: isVi
            ? "Khám phá tính năng bảo vệ kỹ thuật số của esim.vn."
            : "Discover esim.vn's built-in digital protection.",
          href: localizedHref(lang, 'all-destinations'),
          image:
            "https://sb.nordcdn.com/m/7bf573d226cb4b2d/original/mega-menu-explore-security-features.png",
          imageAlt: "A man uses esim.vn's built-in digital protection.",
        },
        {
          title: isVi ? "Tính dữ liệu sử dụng" : "Data usage calculator",
          desc: isVi
            ? "Tìm hiểu bạn cần bao nhiêu dữ liệu cho chuyến đi."
            : "Find out how much data you'll need on your trip.",
          href: localizedHref(lang, 'data-calculator'),
          image:
            "https://sb.nordcdn.com/m/6c224dbf48f13441/original/mega-menu-explore-data-usage-calculator.png",
          imageAlt: "A woman uses esim.vn's data usage calculator.",
        },
        {
          title: "Ultra Plan",
          desc: isVi
            ? "Dữ liệu không giới hạn, hoàn 8% tín dụng và nhiều ưu đãi."
            : "Unlimited data, 8% back in credits, and extra perks.",
          href: localizedHref(lang, 'all-destinations'),
          image:
            "https://sb.nordcdn.com/m/681452996b3d756b/original/mega-menu-explore-ultra-plan.png",
          imageAlt: "The Ultra plan tab on the esim.vn app.",
        },
      ],
      bottomLeft: {
        icon: true,
        text: isVi
          ? "Thiết bị của bạn có tương thích eSIM không?"
          : "Is your device eSIM compatible?",
        href: localizedHref(lang, 'esim-supported-devices'),
      },
      bottomRight: {
        text: isVi ? "Tất cả điểm đến" : "All destinations",
        href: localizedHref(lang, 'all-destinations'),
      },
    },
    offers: {
      col1: [
        {
          icon: "thumbs-up",
          title: isVi ? "Giới thiệu bạn bè" : "Refer a Friend",
          desc: isVi
            ? "Chia sẻ esim.vn với bạn bè và nhận thưởng."
            : "Share esim.vn with friends and earn rewards.",
          href: localizedHref(lang, 'refer-a-friend'),
        },
      ],
      col2: [
        {
          icon: "tag",
          title: isVi ? "Mã giảm giá" : "Coupons",
          desc: isVi
            ? "Nhận ưu đãi tốt nhất và tiết kiệm dữ liệu eSIM!"
            : "Get the best deals and save on eSIM data!",
          href: localizedHref(lang, 'coupon'),
        },
      ],
      explore: [
        {
          title: isVi ? "Tính năng bảo mật" : "Security features",
          desc: isVi
            ? "Khám phá tính năng bảo vệ kỹ thuật số của esim.vn."
            : "Discover esim.vn's built-in digital protection.",
          href: localizedHref(lang, 'all-destinations'),
          image:
            "https://sb.nordcdn.com/m/7bf573d226cb4b2d/original/mega-menu-explore-security-features.png",
          imageAlt: "A man uses esim.vn's built-in digital protection.",
        },
        {
          title: isVi ? "Tính dữ liệu sử dụng" : "Data usage calculator",
          desc: isVi
            ? "Tìm hiểu bạn cần bao nhiêu dữ liệu cho chuyến đi."
            : "Find out how much data you'll need on your trip.",
          href: localizedHref(lang, 'data-calculator'),
          image:
            "https://sb.nordcdn.com/m/6c224dbf48f13441/original/mega-menu-explore-data-usage-calculator.png",
          imageAlt: "A woman uses esim.vn's data usage calculator.",
        },
        {
          title: "Ultra Plan",
          desc: isVi
            ? "Dữ liệu không giới hạn, hoàn 8% tín dụng và nhiều ưu đãi."
            : "Unlimited data, 8% back in credits, and extra perks.",
          href: localizedHref(lang, 'all-destinations'),
          image:
            "https://sb.nordcdn.com/m/681452996b3d756b/original/mega-menu-explore-ultra-plan.png",
          imageAlt: "The Ultra plan tab on the esim.vn app.",
        },
      ],
      bottomLeft: {
        icon: true,
        text: isVi ? "eSIM là gì?" : "What is an eSIM?",
        href: localizedHref(lang, 'what-is-esim'),
      },
      bottomRight: {
       text: isVi ? "Tất cả điểm đến" : "All destinations",
        href: localizedHref(lang, 'all-destinations'),
      },
    },
    help: {
      col1: [
        {
          icon: "help-circle",
          title: isVi ? "Bắt đầu sử dụng" : "Getting Started",
          desc: isVi
            ? "Hướng dẫn nhanh sử dụng ứng dụng esim.vn eSIM."
            : "A quick guide to using the esim.vn app.",
          href: localizedHref(lang, "help-center"),
        },
        {
          icon: "globe",
          title: isVi ? "Trung tâm trợ giúp" : "Help Center",
          desc: isVi
            ? "Duyệt hướng dẫn và tài nguyên hỗ trợ."
            : "Browse guides and support resources.",
          href: localizedHref(lang, "help-center"),
        },
        {
          icon: "triangle-alert",
          title: isVi ? "Khắc phục sự cố" : "Troubleshooting",
          desc: isVi
            ? "Sửa lỗi thường gặp với hướng dẫn từng bước."
            : "Fix common issues with step-by-step help.",
          href: localizedHref(lang, "help-center"),
        },
      ],
      col2: [
        {
          icon: "message-dots",
          title: isVi ? "Câu hỏi thường gặp" : "FAQ",
          desc: isVi
            ? "Tìm câu trả lời cho các câu hỏi phổ biến nhất về esim.vn."
            : "Find answers to the most common questions about esim.vn.",
          href: localizedHref(lang, "help-center"),
        },
      ],
      explore: [
        {
          title: isVi ? "Tính năng bảo mật" : "Security features",
          desc: isVi
            ? "Khám phá tính năng bảo vệ kỹ thuật số của esim.vn."
            : "Discover esim.vn's built-in digital protection.",
          href: localizedHref(lang, 'all-destinations'),
          image:
            "https://sb.nordcdn.com/m/7bf573d226cb4b2d/original/mega-menu-explore-security-features.png",
          imageAlt: "A man uses esim.vn's built-in digital protection.",
        },
        {
          title: isVi ? "Tính dữ liệu sử dụng" : "Data usage calculator",
          desc: isVi
            ? "Tìm hiểu bạn cần bao nhiêu dữ liệu cho chuyến đi."
            : "Find out how much data you'll need on your trip.",
          href: localizedHref(lang, 'data-calculator'),
          image:
            "https://sb.nordcdn.com/m/6c224dbf48f13441/original/mega-menu-explore-data-usage-calculator.png",
          imageAlt: "A woman uses esim.vn's data usage calculator.",
        },
        {
          title: "Ultra Plan",
          desc: isVi
            ? "Dữ liệu không giới hạn, hoàn 8% tín dụng và nhiều ưu đãi."
            : "Unlimited data, 8% back in credits, and extra perks.",
          href: localizedHref(lang, 'all-destinations'),
          image:
            "https://sb.nordcdn.com/m/681452996b3d756b/original/mega-menu-explore-ultra-plan.png",
          imageAlt: "The Ultra plan tab on the esim.vn app.",
        },
      ],
      bottomLeft: {
        icon: true,
        text: isVi ? "eSIM là gì?" : "What is an eSIM?",
        href: localizedHref(lang, 'what-is-esim'),
      },
      bottomRight: {
        text: isVi ? "Tất cả điểm đến" : "All destinations",
        href: localizedHref(lang, 'all-destinations'),
      },
    },
  };
}

const NAV_ITEMS = ["product", "resources", "offers", "help"] as const;

// localStorage key remembering that the user closed the promo/announcement bar
// so it stays hidden across reloads until cleared.
const ANNOUNCEMENT_DISMISSED_KEY = "esim_announcement_dismissed";

/* ===== Main Navbar ===== */

/**
 * Outer dispatcher: picks the right navbar variant based on the current route.
 *
 * Kept side-effect free (no hooks beyond `usePathname`) so the inner
 * `MainNavbar` can own all the React hooks unconditionally and satisfy
 * `react-hooks/rules-of-hooks`.
 */
export function Navbar(props: NavbarProps) {
  const pathname = useNextPathname();

  // Help Center pages get a dedicated navbar (per Phần 7 spec).
  // Use localizedHref to correctly resolve the localized path for each locale:
  // vi → /ho-tro, en → /en/help-center
  const helpCenterPrefix = localizedHref(props.lang, "help-center");
  const isHelpCenterRoute =
    pathname === helpCenterPrefix ||
    pathname === `${helpCenterPrefix}/` ||
    pathname.startsWith(`${helpCenterPrefix}/`);
  if (isHelpCenterRoute) {
    return <HelpCenterNavbar lang={props.lang} />;
  }
  return <MainNavbar {...props} />;
}

function MainNavbar({ lang, dict, topBars = [] }: NavbarProps) {
  const pathname = useNextPathname();
  const isVi = lang === 'vi';
  const homeHref = isVi ? '/' : `/${lang}`;
  const isLandingPage = pathname === homeHref || pathname === `${homeHref}/`;
  // About Us page (localized: /gioi-thieu in vi, /about-us in en) gets a solid
  // white navbar background instead of the default transparent/blur header.
  const isAboutUsPage = /(?:^|\/)(?:gioi-thieu|about-us)\/?$/.test(pathname);
  const [announcementVisible, setAnnouncementVisible] = useState(true);
  const dismissAnnouncement = useCallback(() => {
    setAnnouncementVisible(false);
    try {
      localStorage.setItem(ANNOUNCEMENT_DISMISSED_KEY, "true");
    } catch {
      // localStorage unavailable — dismissal just won't persist.
    }
  }, []);
  const [hasScrolled, setHasScrolled] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [destinationsOpen, setDestinationsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user, openAuthModal, logout } = useAuth();
  const { apiCartItems, isApiCart, getLocalCartData } = useCart();
  const cartCount = isApiCart
    ? apiCartItems.length
    : (typeof window !== "undefined" ? getLocalCartData().items.length : 0);

  const menuData = getMenuData(lang);
  const firstTopBar = topBars[0];
  const announcementText = firstTopBar
    ? pickLocalizedTitle(firstTopBar, lang).trim()
    : "";
  const announcementCta = firstTopBar?.buttonContent?.trim() || "";
  const announcementHref = firstTopBar?.url?.trim() || "";
  const announcementIconUrl = firstTopBar
    ? resolveFileUrl(firstTopBar.icon)
    : null;
  const hasAnnouncement = Boolean(firstTopBar && announcementText);
  const hasAnnouncementCta = Boolean(announcementCta && announcementHref);

  const intlRouter = useIntlRouter();
  const intlPathname = useIntlPathname();

  const handleLangChange = useCallback((newLocale: string) => {
    // Destination/region pages (`/[slug]`) use the same public slug in both
    // locales, so keep the current slug and only add/remove the locale prefix
    // (e.g. /thailand → /en/thailand). Legal pages (`/legal/[slug]`) use a
    // different slug per locale, so map it explicitly. Other dynamic routes
    // still fall back to safe parent paths to avoid missing next-intl params.
    if (intlPathname === "/[slug]" || intlPathname === "/legal/[slug]") {
      // Persist the target locale in the NEXT_LOCALE cookie before the hard
      // navigation. Otherwise next-intl's middleware reads the stale cookie and
      // redirects the prefix-less default-locale path (e.g. /thailand) back to
      // the previous locale (e.g. /en/thailand), so the switch never happens.
      document.cookie = `NEXT_LOCALE=${newLocale};path=/;max-age=${60 * 60 * 24 * 365};samesite=lax`;
      window.location.href =
        intlPathname === "/legal/[slug]"
          ? resolveLegalLangSwitchPath(pathname, newLocale)
          : resolveDynamicLangSwitchPath(pathname, lang, newLocale);
      return;
    }

    const target = resolveLangSwitchPath(intlPathname);
    intlRouter.replace(target as any, { locale: newLocale });
  }, [intlRouter, intlPathname, lang, pathname]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpenDropdown(null);
        setDestinationsOpen(false);
      }
    }
    if (openDropdown || destinationsOpen) {
      document.addEventListener("mousedown", handleClick);
    }
    return () => document.removeEventListener("mousedown", handleClick);
  }, [openDropdown, destinationsOpen]);

  // Close on Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpenDropdown(null);
        setDestinationsOpen(false);
      }
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setHasScrolled(window.scrollY > 8);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Restore the dismissed state after mount so a closed announcement stays
  // hidden across reloads. Reading in an effect (not useState initializer)
  // keeps server and first client render in sync to avoid hydration mismatch.
  useEffect(() => {
    try {
      if (localStorage.getItem(ANNOUNCEMENT_DISMISSED_KEY) === "true") {
        setAnnouncementVisible(false);
      }
    } catch {
      // localStorage unavailable — keep default visible.
    }
  }, []);

  return (
    <>
      <div className="sticky top-0 z-40">
        {/* ===== Announcement Bar (Carousel) ===== */}
        {announcementVisible && hasAnnouncement && isLandingPage && (
          <div className="relative bg-[#1a1a1a] text-text-primary-on-color overflow-hidden">
            <div className="px-6 min-w-full flex justify-between items-center md:gap-3">
              {topBars.length > 1 ? (
                /* Multiple promotions — Animation 3.1: smooth cross-fade
                   between announcements so the copy never snaps abruptly. */
                <div className="flex-1 min-w-0 py-3">
                  <Swiper
                    modules={[Autoplay, EffectFade]}
                    effect="fade"
                    fadeEffect={{ crossFade: true }}
                    speed={700}
                    spaceBetween={0}
                    slidesPerView={1}
                    loop
                    allowTouchMove={false}
                    autoplay={{
                      delay: 4500,
                      disableOnInteraction: false,
                      pauseOnMouseEnter: true,
                    }}
                    className="w-full announcement-swiper"
                  >
                    {topBars.map((bar, idx) => {
                      const text = pickLocalizedTitle(bar, lang).trim();
                      const cta = bar.buttonContent?.trim() || "";
                      const href = bar.url?.trim() || "";
                      const iconUrl = resolveFileUrl(bar.icon);
                      const hasCta = Boolean(cta && href);
                      if (!text) return null;
                      return (
                        <SwiperSlide key={bar.id || idx}>
                          <div className="flex justify-center items-center w-full gap-3">
                            <div className="hidden md:flex items-center gap-3">
                              <AnnouncementIcon iconUrl={iconUrl} />
                              <p className="body-sm text-text-primary-on-color">
                                {text}
                              </p>
                              {hasCta && (
                                <Link
                                  href={href}
                                  className="inline-block text-text-primary-on-color border-md border-[#FFFFFF] hover:bg-bg-secondary hover:text-text-primary rounded-full transition-colors body-sm-medium px-6 py-[5.5px]"
                                >
                                  {cta}
                                </Link>
                              )}
                            </div>
                            <div className="flex md:hidden flex-col gap-2 w-full pr-8">
                              <div className="flex items-center gap-2">
                                <AnnouncementIcon iconUrl={iconUrl} />
                                <p className="body-sm text-text-primary-on-color">
                                  {text}
                                </p>
                              </div>
                              {hasCta && (
                                <Link
                                  href={href}
                                  className="w-full text-center text-text-primary-on-color border-md border-[#FFFFFF] hover:bg-bg-secondary hover:text-text-primary rounded-full transition-colors body-sm-medium px-6 py-[5.5px]"
                                >
                                  {cta}
                                </Link>
                              )}
                            </div>
                          </div>
                        </SwiperSlide>
                      );
                    })}
                  </Swiper>
                </div>
              ) : (
                /* Single promotion */
                <div className="flex py-3 md:justify-center items-center w-full md:gap-3">
                  <div className="hidden md:flex items-center gap-3">
                    <AnnouncementIcon iconUrl={announcementIconUrl} />
                    <p className="body-sm text-text-primary-on-color">
                      {announcementText}
                    </p>
                    {hasAnnouncementCta && (
                      <Link
                        href={announcementHref}
                        className="inline-block text-text-primary-on-color border-md border-[#FFFFFF] hover:bg-bg-secondary hover:text-text-primary rounded-full transition-colors body-sm-medium px-6 py-[5.5px]"
                      >
                        {announcementCta}
                      </Link>
                    )}
                  </div>
                  <div className="flex md:hidden flex-col gap-2 w-full pr-8">
                    <div className="flex items-center gap-2">
                      <AnnouncementIcon iconUrl={announcementIconUrl} />
                      <p className="body-sm text-text-primary-on-color">
                        {announcementText}
                      </p>
                    </div>
                    {hasAnnouncementCta && (
                      <Link
                        href={announcementHref}
                        className="w-full text-center text-text-primary-on-color border-md border-[#FFFFFF] hover:bg-bg-secondary hover:text-text-primary rounded-full transition-colors body-sm-medium px-6 py-[5.5px]"
                      >
                        {announcementCta}
                      </Link>
                    )}
                  </div>
                </div>
              )}
              <button
                onClick={dismissAnnouncement}
                className="z-10 flex h-5 md:h-6 ml-auto md:ml-0 max-md:absolute top-3 right-6 cursor-pointer"
                aria-label="Close announcement"
              >
                <X className="w-5 h-5 md:w-6 md:h-6 text-[rgba(255,255,255,0.6)] hover:text-white transition-colors" />
              </button>
            </div>
          </div>
        )}

        {/* ===== Main Header ===== */}
        <header
          className={cn(
            "relative transition-all duration-300",
            destinationsOpen || openDropdown ? "bg-primary" :
              isAboutUsPage
                ? "bg-white"
                : hasScrolled
                  ? "bg-[rgba(255,255,255,0.1)] backdrop-blur-[98px] [-webkit-backdrop-filter:blur(98px)]"
                  : "bg-transparent backdrop-blur-0 [-webkit-backdrop-filter:blur(0px)]"
          )}
          id="header"
          ref={dropdownRef}
        >
          <div className="p-4 lg:px-6 lg:py-5">
            <nav
              className="flex items-center justify-between max-w-[1600px] h-6 lg:h-8 mx-auto"
              aria-label="Main navigation"
            >
              {/* Logo */}
              <div className="pr-12">
                <Link href={homeHref} className="block">
                  <SailyLogo />
                  <span className="sr-only">esim.vn</span>
                </Link>
              </div>

              {/* Desktop Nav */}
              <div className="flex gap-4 items-center">
                <div className="hidden lg:flex gap-1">
                  {NAV_ITEMS.map((item) => (
                    <button
                      key={item}
                      onClick={() =>
                        setOpenDropdown(openDropdown === item ? null : item)
                      }
                      className={cn(
                        "px-3 py-1.5 body-sm-medium text-text-primary bg-transparent rounded-md cursor-pointer flex gap-2 items-center transition-colors duration-200 hover:bg-[rgba(0,0,0,0.06)]",
                        openDropdown === item && "bg-[rgba(0,0,0,0.06)]"
                      )}
                      aria-expanded={openDropdown === item}
                    >
                      {dict[item]}
                      {item === "product" && (
                        <span className="text-center whitespace-nowrap rounded-full inline-block border-md border-border-focus text-text-primary py-0.5 px-2 body-2xs-medium">
                          {dict.new}
                        </span>
                      )}
                      <ChevronDown
                        className={cn(
                          "w-4 h-4 text-text-tertiary transition-transform duration-200",
                          openDropdown === item && "rotate-180"
                        )}
                      />
                    </button>
                  ))}
                </div>

                {/* Destinations Button */}
                <button
                  onClick={() => {
                    setDestinationsOpen(!destinationsOpen);
                    setOpenDropdown(null);
                  }}
                  className={cn(
                    "hidden lg:flex items-center gap-2 px-6 py-[5.5px] text-text-primary border border-black rounded-full body-sm-medium cursor-pointer transition-all duration-200 hover:bg-bg-dark hover:text-text-primary-on-color hover:border-bg-dark group",
                  )}
                >
                  <Search className={cn(
                    "w-3 h-3 transition-colors group-hover:text-text-primary-on-color",
                  )} />
                  {lang === "vi" ? "Điểm đến" : "Destinations"}
                </button>

                {/* Cart Button */}
                <Link
                  href={localizedHref(lang, "cart")}
                  className="hidden lg:flex relative items-center px-3 py-[7px] text-text-primary transition-colors rounded-lg cursor-pointer hover:bg-[rgba(0,0,0,0.06)]"
                  aria-label={lang === "vi" ? "Giỏ hàng" : "Cart"}
                >
                  <ShoppingCart className="w-4 h-4" />
                  {cartCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[12px] font-bold text-white bg-red-500 rounded-full">
                      {cartCount > 99 ? "99+" : cartCount}
                    </span>
                  )}
                </Link>

                {/* Language Picker */}
                <div className="hidden lg:flex">
                  <div className="relative inline-flex items-center px-3 py-[7px] text-text-primary transition-colors rounded-lg cursor-pointer hover:bg-[rgba(0,0,0,0.06)]">
                    <Globe className="w-4 h-4 mr-1" />
                    <span className="body-sm-medium uppercase min-w-5">
                      {lang}
                    </span>
                    <ChevronDown className="w-3 h-3 ml-1 text-text-tertiary" />
                    <select
                      className="w-full h-full absolute inset-0 cursor-pointer opacity-0"
                      value={lang}
                      onChange={(e) => handleLangChange(e.target.value)}
                      aria-label="Select language"
                    >
                      <option value="en">English</option>
                      <option value="vi">Tiếng Việt</option>
                    </select>
                  </div>
                </div>

                {/* Auth Button */}
                <div className="hidden lg:flex">
                  {user ? (
                    <div className="flex items-center gap-2">
                      <Link
                        href={localizedHref(lang, "profile")}
                        className="flex items-center gap-2 px-3 py-[7px] text-text-primary transition-colors rounded-lg cursor-pointer hover:bg-[rgba(0,0,0,0.06)]"
                      >
                        <User className="w-4 h-4" />
                        <span className="body-sm-medium max-w-[120px] truncate">
                          {user.firstName || user.email}
                        </span>
                      </Link>
                      <button
                        onClick={logout}
                        className="flex items-center gap-1 px-3 py-[7px] text-text-tertiary transition-colors rounded-lg cursor-pointer hover:bg-[rgba(0,0,0,0.06)] hover:text-text-primary"
                        aria-label={lang === "vi" ? "Đăng xuất" : "Sign out"}
                      >
                        <LogOut className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={openAuthModal}
                      className="flex items-center gap-2 px-5 py-[5.5px] text-text-primary-on-color bg-bg-dark hover:bg-gray-700 border-md border-bg-dark rounded-full transition-colors body-sm-medium cursor-pointer"
                    >
                      <User className="w-3.5 h-3.5" />
                      {lang === "vi" ? "Đăng nhập" : "Sign In"}
                    </button>
                  )}
                </div>
              </div>

              {/* Mobile Cart + Menu */}
              <div className="flex items-center gap-6 ml-6 lg:hidden">
                <Link
                  href={localizedHref(lang, "cart")}
                  className="relative flex items-center justify-center w-6 h-6"
                  aria-label={lang === "vi" ? "Giỏ hàng" : "Cart"}
                >
                  <ShoppingCart className="w-5 h-5 text-text-primary" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1.5 -right-2 flex items-center justify-center min-w-[16px] h-[16px] px-0.5 text-[11px] font-bold text-white bg-red-500 rounded-full">
                      {cartCount > 99 ? "99+" : cartCount}
                    </span>
                  )}
                </Link>
                <MobileSidebar
                  lang={lang}
                  dict={dict}
                  onLangChange={handleLangChange}
                />
              </div>
            </nav>
          </div>

          {/* ===== Mega Menu Dropdown ===== */}
          {openDropdown && menuData[openDropdown] && (
            <MegaMenuDropdown
              data={menuData[openDropdown]}
              onClose={() => setOpenDropdown(null)}
            />
          )}

          {/* ===== Destination Dropdown ===== */}
          {destinationsOpen && (
            <DestinationDropdown
              lang={lang}
              dict={dict.destinations}
              onClose={() => setDestinationsOpen(false)}
            />
          )}
        </header>

      </div >

      {/* ===== Dropdown Backdrop Overlay (outside sticky wrapper, below navbar) ===== */}
      {(openDropdown || destinationsOpen) && (
        <div
          className="fixed inset-0 bg-[rgba(0,0,0,0.01)] backdrop-blur-[4px] z-30"
          onClick={() => {
            setOpenDropdown(null);
            setDestinationsOpen(false);
          }}
          aria-hidden="true"
        />
      )}
    </>
  );
}

/* ===== Mega Menu Dropdown ===== */

function MegaMenuDropdown({
  data,
  onClose,
}: {
  data: MegaMenuData;
  onClose: () => void;
}) {
  return (
    <div className="hidden lg:block absolute w-full px-6 top-full left-0 rounded-b-md bg-white shadow-[0_8px_12px_-6px_rgba(149,157,165,0.2)] z-[60] animate-fade-in">
      <div className="flex flex-col max-w-[1600px] mx-auto">
        {/* Main content */}
        <div className="flex gap-6 justify-between border-t border-border-secondary py-6">
          {/* Link columns */}
          <div className="flex gap-6">
            <div className="flex flex-col gap-4 lg:w-[300px] xl:w-80">
              {data.col1Label && (
                <span className="body-xs-medium text-text-tertiary">{data.col1Label}</span>
              )}
              {data.col1.map((item) => (
                <MenuLinkItem key={item.title} item={item} onClose={onClose} />
              ))}
            </div>
            {data.col2.length > 0 && (
              <div className="flex flex-col gap-4 lg:w-[300px] xl:w-80">
                {data.col2Label && (
                  <span className="body-xs-medium text-text-tertiary">{data.col2Label}</span>
                )}
                {data.col2.map((item) => (
                  <MenuLinkItem key={item.title} item={item} onClose={onClose} />
                ))}
              </div>
            )}
          </div>

          {/* Explore Swiper */}
          <div className="flex flex-col gap-4 lg:w-[296px] xl:w-[300px]">
            <span className="body-xs-medium text-text-tertiary">Explore</span>
            <Swiper
              modules={[Pagination, Autoplay]}
              spaceBetween={24}
              slidesPerView={1}
              loop
              autoplay={{ delay: 4000, disableOnInteraction: false }}
              pagination={{
                clickable: true,
                bulletClass:
                  "block rounded-full transition-all bg-text-tertiary w-2 h-2 cursor-pointer",
                bulletActiveClass: "!px-4 !bg-bg-dark",
                el: ".explore-pagination",
              }}
              className="w-full"
            >
              {data.explore.map((card) => (
                <SwiperSlide key={card.title}>
                  <Link
                    href={card.href}
                    onClick={onClose}
                    className="block group rounded-sm"
                  >
                    <div className="flex flex-col gap-3">
                      <div className="rounded-sm overflow-hidden">
                        <div className="lg:w-[296px] lg:h-[148px] xl:w-[300px] xl:h-[150px] group-hover:scale-105 transition-transform duration-300">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            alt={card.imageAlt}
                            src={card.image}
                            width={300}
                            height={150}
                            loading="lazy"
                            className="w-full h-full object-cover"
                            style={{ color: "transparent" }}
                          />
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <p className="body-sm-medium text-text-primary text-left">
                          {card.title}
                        </p>
                        <p className="body-xs text-text-tertiary text-left">
                          {card.desc}
                        </p>
                      </div>
                    </div>
                  </Link>
                </SwiperSlide>
              ))}
            </Swiper>
            <div className="explore-pagination flex gap-2 mt-1" />
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex justify-between items-center border-t border-border-secondary py-6">
          <div className="flex items-center gap-2">
            <Info className="w-3 h-3 text-text-primary" />
            <Link
              href={data.bottomLeft.href}
              onClick={onClose}
              className="body-sm-medium text-text-primary hover:text-text-secondary transition-colors"
            >
              {data.bottomLeft.text}
            </Link>
          </div>
          <Link
            href={data.bottomRight.href}
            onClick={onClose}
            className="inline-block text-text-primary-on-color bg-bg-dark hover:bg-gray-700 border-md border-bg-dark rounded-full transition-colors body-sm-medium px-6 py-[5.5px]"
          >
            {data.bottomRight.text}
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ===== Menu Link Item ===== */

function MenuLinkItem({
  item,
  onClose,
}: {
  item: MenuLink & { badge?: string };
  onClose: () => void;
}) {
  return (
    <Link
      href={item.href}
      onClick={onClose}
      className="rounded-sm w-full block group p-3 hover:bg-bg-secondary transition-colors duration-200"
    >
      <div className="flex flex-row gap-2">
        <div className="flex items-center justify-center h-6 w-6 rounded-full shrink-0 text-text-primary bg-bg-brand-yellow">
          <svg
            className="w-3 h-3"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d={ICON_SVG[item.icon] || ICON_SVG.globe} />
          </svg>
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex flex-row items-center gap-2">
            <p className="body-sm-medium text-text-primary text-left">
              {item.title}
            </p>
            {item.badge && (
              <span className="text-center whitespace-nowrap rounded-full inline-block border-md border-border-focus text-text-primary py-0.5 px-2 body-2xs-medium">
                {item.badge}
              </span>
            )}
          </div>
          <p className="body-xs text-text-tertiary text-left">{item.desc}</p>
        </div>
      </div>
    </Link>
  );
}

/* ===== Mobile Sidebar ===== */

function MobileSidebar({
  lang,
  dict,
  onLangChange,
}: {
  lang: Locale;
  dict: Record<string, any>;
  onLangChange: (val: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const { user, openAuthModal, logout } = useAuth();

  const menuData = getMenuData(lang);
  const isVi = lang === 'vi';
  const homeHref = isVi ? '/' : `/${lang}`;
  const localePrefix = isVi ? '' : `/${lang}`;

  // Inline search state
  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const debouncedQuery = useDebounce(searchQuery, 300);

  const { data: topDestinations = [], isLoading: isLoadingTop } =
    useTopDestinations(10);

  const { data: searchResults = [], isFetching: isSearchFetching } =
    useSearchDestinations(
      debouncedQuery,
      debouncedQuery.trim().length > 0
    );

  const { data: searchRegions = [], isFetching: isSearchRegionsFetching } =
    useSearchRegions(
      debouncedQuery,
      debouncedQuery.trim().length > 0
    );

  const isActiveSearch = debouncedQuery.trim().length > 0;
  const displayDestinations = isActiveSearch ? searchResults : topDestinations;
  const showLoading = isActiveSearch
    ? (isSearchFetching || isSearchRegionsFetching)
    : isLoadingTop;

  // Clear search when sidebar closes
  useEffect(() => {
    if (!open) {
      setSearchQuery("");
      setShowResults(false);
    }
  }, [open]);

  // Close search results on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        showResults &&
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node)
      ) {
        setShowResults(false);
      }
    }
    if (showResults) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showResults]);

  const handleClearSearch = useCallback(() => {
    setSearchQuery("");
    inputRef.current?.focus();
  }, []);

  /* Build destination href */
  const getDestinationHref = (dest: any) =>
    `${localePrefix}/${dest.slug || dest.code?.toLowerCase()}`;

  /* Build region href */
  const getRegionHref = (region: any) =>
    `${localePrefix}/${region.slug}`;

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button
          className="w-6 h-6 flex items-center justify-center cursor-pointer"
          aria-label="Toggle sidebar"
        >
          <div className="space-y-[4.5px]">
            <div className="w-[19px] h-[2px] bg-bg-dark" />
            <div className="w-[19px] h-[2px] bg-bg-dark" />
            <div className="w-[19px] h-[2px] bg-bg-dark" />
          </div>
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[9998] bg-black/50 data-[state=open]:animate-fade-in" />
        <Dialog.Content className="fixed top-0 right-0 h-dvh z-[9999] w-full bg-white overflow-y-auto scrollbar-none focus:outline-none data-[state=open]:animate-fade-in">
          <div className="flex flex-col grow h-full justify-between">
            {/* pb-44 reserves space for the fixed bottom CTA bar so the last
                nav items / language selector can scroll clear of it. */}
            <div className="px-4 pb-44">
              {/* Header */}
              <div className="flex justify-between items-center mb-4 sticky top-0 z-50 py-4 bg-white h-14">
                <Link href={homeHref} onClick={() => setOpen(false)}>
                  <SailyLogo />
                </Link>
                <Dialog.Close asChild>
                  <button className="w-6 h-6 flex items-center justify-center cursor-pointer" aria-label="Close">
                    <X className="w-6 h-6" />
                  </button>
                </Dialog.Close>
              </div>

              {/* Search */}
              <div ref={searchContainerRef} className="relative w-full mb-4">
                {/* Search input */}
                <div className="relative">
                  {showLoading && isActiveSearch ? (
                    <Loader2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-tertiary animate-spin" />
                  ) : (
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-tertiary" />
                  )}
                  <input
                    ref={inputRef}
                    placeholder={lang === "vi" ? "Bạn đang đi du lịch ở đâu?" : "Where are you travelling to?"}
                    className="body-md bg-bg-secondary outline-none appearance-none w-full leading-relaxed py-[12.5px] pl-12 pr-12 text-text-primary placeholder-text-tertiary focus:border focus:border-border-focus transition-colors rounded-full"
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setShowResults(true);
                    }}
                    onFocus={() => setShowResults(true)}
                  />
                  {searchQuery ? (
                    <button
                      onClick={handleClearSearch}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-text-tertiary hover:text-text-primary hover:bg-border-primary transition-colors"
                      aria-label="Clear search"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <div className="absolute top-1/2 -translate-y-1/2 right-2 flex items-center justify-center rounded-full h-8 w-8 bg-bg-dark">
                      <Search className="w-3 h-3 text-text-primary-on-color" />
                    </div>
                  )}
                </div>

                {/* Inline search results dropdown */}
                {showResults && (
                  <div className="mt-2 rounded-md bg-white border border-border-primary shadow-lg overflow-hidden">
                    <div className="max-h-[320px] overflow-y-auto">
                      {showLoading && displayDestinations.length === 0 && !isActiveSearch ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="w-5 h-5 text-text-tertiary animate-spin" />
                        </div>
                      ) : isActiveSearch ? (
                        /* ===== Search Results: combined destinations + regions ===== */
                        <div>
                          {showLoading && searchResults.length === 0 && searchRegions.length === 0 ? (
                            <div className="flex items-center justify-center py-8">
                              <Loader2 className="w-5 h-5 text-text-tertiary animate-spin" />
                            </div>
                          ) : searchResults.length === 0 && searchRegions.length === 0 ? (
                            <div className="text-center py-8">
                              <MapPin className="w-6 h-6 text-text-disabled mx-auto mb-2" />
                              <p className="body-sm text-text-tertiary">
                                {lang === "vi" ? "Không tìm thấy kết quả" : "No results found"}
                              </p>
                            </div>
                          ) : (
                            <>
                              {!isSearchFetching && !isSearchRegionsFetching && (
                                <p className="px-4 pt-3 pb-1 body-xs text-text-tertiary">
                                  {searchResults.length + searchRegions.length} {lang === "vi" ? "kết quả" : "results"}
                                </p>
                              )}
                              {/* Destinations */}
                              {searchResults.length > 0 && (
                                <>
                                  <p className="px-4 pt-2 pb-1 body-xs-medium text-text-tertiary uppercase tracking-wider">
                                    {lang === "vi" ? "Điểm đến" : "Destinations"}
                                  </p>
                                  {searchResults.map((dest) => (
                                    <Link
                                      key={`dest-${dest.id}`}
                                      href={getDestinationHref(dest)}
                                      onClick={() => setOpen(false)}
                                      className="w-full flex items-center gap-3 p-3 text-left hover:bg-bg-secondary transition-colors group"
                                    >
                                      <div className="w-8 h-6 rounded overflow-hidden flex-shrink-0 bg-bg-secondary">
                                        {dest.flagUrl ? (
                                          <img
                                            src={dest.flagUrl}
                                            alt={`${dest.name} flag`}
                                            className="w-full h-full object-cover"
                                          />
                                        ) : (
                                          <div className="w-full h-full flex items-center justify-center">
                                            <MapPin className="w-4 h-4 text-text-tertiary" />
                                          </div>
                                        )}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p className="body-md-medium text-text-primary truncate">
                                          {(lang === "vi" ? dest.titleVi : dest.title) || dest.name}
                                        </p>
                                      </div>
                                      <ChevronRight className="w-4 h-4 text-text-disabled group-hover:text-text-secondary transition-colors flex-shrink-0" />
                                    </Link>
                                  ))}
                                </>
                              )}
                              {/* Regions */}
                              {searchRegions.length > 0 && (
                                <>
                                  <p className="px-4 pt-2 pb-1 body-xs-medium text-text-tertiary uppercase tracking-wider">
                                    {lang === "vi" ? "Khu vực" : "Regions"}
                                  </p>
                                  {searchRegions.map((region) => (
                                    <Link
                                      key={`region-${region.id}`}
                                      href={getRegionHref(region)}
                                      onClick={() => setOpen(false)}
                                      className="w-full flex items-center gap-3 p-3 text-left hover:bg-bg-secondary transition-colors group"
                                    >
                                      <div className="w-8 h-6 rounded overflow-hidden flex-shrink-0 bg-bg-secondary">
                                        {region.iconUrl ? (
                                          <img
                                            src={region.iconUrl}
                                            alt={`${region.name} region`}
                                            className="w-full h-full object-cover"
                                          />
                                        ) : (
                                          <div className="w-full h-full flex items-center justify-center">
                                            <MapPin className="w-4 h-4 text-text-tertiary" />
                                          </div>
                                        )}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p className="body-md-medium text-text-primary truncate">
                                          {(lang === "vi" ? region.titleVi : region.title) || region.name}
                                        </p>
                                      </div>
                                      <ChevronRight className="w-4 h-4 text-text-disabled group-hover:text-text-secondary transition-colors flex-shrink-0" />
                                    </Link>
                                  ))}
                                </>
                              )}
                            </>
                          )}
                        </div>
                      ) : displayDestinations.length === 0 ? (
                        <div className="text-center py-8">
                          <MapPin className="w-6 h-6 text-text-disabled mx-auto mb-2" />
                          <p className="body-sm text-text-tertiary">
                            {lang === "vi" ? "Đang tải..." : "Loading destinations..."}
                          </p>
                        </div>
                      ) : (
                        /* ===== No search: Top Destinations ===== */
                        <div>
                          <p className="px-4 pt-3 pb-1 body-xs-medium text-text-tertiary uppercase tracking-wider">
                            {lang === "vi" ? "Điểm đến hàng đầu" : "Top Destinations"}
                          </p>
                          {displayDestinations.map((dest) => (
                            <Link
                              key={dest.id}
                              href={getDestinationHref(dest)}
                              onClick={() => setOpen(false)}
                              className="w-full flex items-center gap-3 p-3 text-left hover:bg-bg-secondary transition-colors group"
                            >
                              <div className="w-8 h-6 rounded overflow-hidden flex-shrink-0 bg-bg-secondary">
                                {dest.flagUrl ? (
                                  <img
                                    src={dest.flagUrl}
                                    alt={`${dest.name} flag`}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <MapPin className="w-4 h-4 text-text-tertiary" />
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="body-md-medium text-text-primary truncate">
                                  {dest.name}
                                </p>
                              </div>
                              <ChevronRight className="w-4 h-4 text-text-disabled group-hover:text-text-secondary transition-colors flex-shrink-0" />
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Nav Items - Accordion */}
              <div className="space-y-1">
                {NAV_ITEMS.map((item) => {
                  const isExpanded = expandedItem === item;
                  const data = menuData[item];
                  return (
                    <div key={item} className="border-b py-3">
                      <button
                        onClick={() =>
                          setExpandedItem(isExpanded ? null : item)
                        }
                        className="flex items-center  justify-between w-full body-md-medium text-text-primary cursor-pointer hover:bg-bg-primary transition-colors duration-200"
                      >
                        <span className="flex items-center gap-2">
                          {dict[item]}
                          {item === "product" && (
                            <span className="text-center whitespace-nowrap rounded-full inline-block border-md border-border-focus text-text-primary py-0.5 px-2 body-2xs-medium">
                              {dict.new}
                            </span>
                          )}
                        </span>
                        <ChevronDown
                          className={cn(
                            "w-4 h-4 text-text-tertiary transition-transform duration-200",
                            isExpanded ? "rotate-0" : "-rotate-90"
                          )}
                        />
                      </button>
                      {/* Accordion content */}
                      {isExpanded && data && (
                        <div className="bg-bg-secondary rounded-sm mb-1 mt-2 overflow-hidden">
                          <div className="p-4 flex flex-col gap-4 md:gap-6">
                            {/* Col1 */}
                            <div className="flex flex-col gap-4">
                              {data.col1Label && (
                                <span className="body-xs-medium text-text-tertiary">
                                  {data.col1Label}
                                </span>
                              )}
                              {data.col1.map((link) => (
                                <Link
                                  key={link.title}
                                  href={link.href}
                                  onClick={() => setOpen(false)}
                                  className="rounded-sm w-full block group hover:bg-bg-primary transition-colors duration-200"
                                >
                                  <div className="flex flex-row gap-2 items-center">
                                    <div className="flex items-center justify-center h-6 w-6 rounded-full shrink-0 text-text-primary bg-bg-brand-yellow">
                                      <svg
                                        className="w-3 h-3"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                      >
                                        <path d={ICON_SVG[link.icon] || ICON_SVG.globe} />
                                      </svg>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                      <div className="flex flex-row items-center gap-2">
                                        <p className="body-sm-medium text-text-primary text-left">
                                          {link.title}
                                        </p>
                                        {link.badge && (
                                          <span className="text-center whitespace-nowrap rounded-full inline-block border-md border-border-focus text-text-primary py-0.5 px-2 body-2xs-medium">
                                            {link.badge}
                                          </span>
                                        )}
                                      </div>
                                      <p className="hidden sm:block body-xs text-text-tertiary text-left">
                                        {link.desc}
                                      </p>
                                    </div>
                                  </div>
                                </Link>
                              ))}
                            </div>
                            {/* Col2 */}
                            {data.col2.length > 0 && (
                              <div className="flex flex-col gap-4">
                                {data.col2Label && (
                                  <span className="body-xs-medium text-text-tertiary">
                                    {data.col2Label}
                                  </span>
                                )}
                                {data.col2.map((link) => (
                                  <Link
                                    key={link.title}
                                    href={link.href}
                                    onClick={() => setOpen(false)}
                                    className="rounded-sm w-full block group hover:bg-bg-primary transition-colors duration-200"
                                  >
                                    <div className="flex flex-row gap-2 items-center">
                                      <div className="flex items-center justify-center h-6 w-6 rounded-full shrink-0 text-text-primary bg-bg-brand-yellow">
                                        <svg
                                          className="w-3 h-3"
                                          viewBox="0 0 24 24"
                                          fill="none"
                                          stroke="currentColor"
                                          strokeWidth="2"
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                        >
                                          <path d={ICON_SVG[link.icon] || ICON_SVG.globe} />
                                        </svg>
                                      </div>
                                      <div className="flex flex-col gap-1">
                                        <div className="flex flex-row items-center gap-2">
                                          <p className="body-sm-medium text-text-primary text-left">
                                            {link.title}
                                          </p>
                                          {link.badge && (
                                            <span className="text-center whitespace-nowrap rounded-full inline-block border-md border-border-focus text-text-primary py-0.5 px-2 body-2xs-medium">
                                              {link.badge}
                                            </span>
                                          )}
                                        </div>
                                        <p className="hidden sm:block body-xs text-text-tertiary text-left">
                                          {link.desc}
                                        </p>
                                      </div>
                                    </div>
                                  </Link>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Language */}
              <div className="relative mt-4 py-3 rounded-lg cursor-pointer hover:bg-bg-primary transition-colors">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  <span className="body-md-medium">{lang === "en" ? "English" : "Tiếng Việt"}</span>
                </div>
                <select
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  value={lang}
                  onChange={(e) => onLangChange(e.target.value)}
                >
                  <option value="en">English</option>
                  <option value="vi">Tiếng Việt</option>
                </select>
              </div>
            </div>

            {/* Bottom CTAs */}
            <div className="fixed w-full bg-white bottom-0 p-4 space-y-3 border-t border-border-primary mt-auto">
              {user ? (
                <>
                  <Link
                    href={localizedHref(lang, "profile")}
                    className="flex items-center justify-center gap-2 w-full px-5 py-3 bg-bg-dark text-white body-md-medium rounded-full cursor-pointer hover:bg-bg-accent-hover transition-colors"
                    onClick={() => setOpen(false)}
                  >
                    <User className="w-4 h-4" />
                    {user.firstName || user.email}
                  </Link>
                  <button
                    onClick={() => { logout(); setOpen(false); }}
                    className="flex items-center justify-center gap-2 w-full px-5 py-3 border-md border-border-focus text-text-primary body-md-medium rounded-full cursor-pointer hover:bg-bg-primary transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    {lang === "vi" ? "Đăng xuất" : "Sign Out"}
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => { openAuthModal(); setOpen(false); }}
                    className="flex items-center justify-center gap-2 w-full px-5 py-3 bg-bg-dark text-white body-md-medium rounded-full cursor-pointer hover:bg-bg-accent-hover transition-colors"
                  >
                    <User className="w-4 h-4" />
                    {lang === "vi" ? "Đăng nhập" : "Sign In"}
                  </button>
                  <Link
                    href={localizedHref(lang, "all-destinations")}
                    className="block w-full text-center px-5 py-3 border-md border-border-focus text-text-primary body-md-medium rounded-full cursor-pointer hover:bg-bg-primary transition-colors"
                    onClick={() => setOpen(false)}
                  >
                    {dict.downloadApp}
                  </Link>
                </>
              )}
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
