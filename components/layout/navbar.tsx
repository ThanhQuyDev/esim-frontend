"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import * as Dialog from "@radix-ui/react-dialog";
import { cn } from "@/lib/utils";
import { SailyLogo } from "@/components/icons/saily-logo";
import { DestinationSearch } from "@/components/layout/destination-search";
import { DestinationDropdown } from "@/components/layout/destination-dropdown";
import {
  ChevronDown,
  Search,
  X,
  Globe,
  UserPlus,
  Info,
} from "lucide-react";
import type { Locale } from "@/lib/i18n-config";

// Swiper
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";

/* ===== Types ===== */

interface NavbarProps {
  lang: Locale;
  dict: Record<string, any>;
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
      col1Label: "Features",
      col1: [
        {
          icon: "gem",
          title: "Ultra Plan",
          desc: isVi
            ? "Gói du lịch cao cấp tất cả trong một."
            : "Your all-in-one premium travel plan.",
          href: "#",
          badge: isVi ? "Mới" : "New",
        },
        {
          icon: "briefcase",
          title: isVi ? "eSIM cho Doanh nghiệp" : "eSIM for Business",
          desc: isVi
            ? "Quản lý gói dữ liệu đội nhóm trong một bảng điều khiển."
            : "All team data plans in one dashboard.",
          href: "#",
          badge: isVi ? "Mới" : "New",
        },
        {
          icon: "shield-check",
          title: isVi ? "Tính năng bảo mật" : "Security Features",
          desc: isVi
            ? "Bảo vệ dữ liệu an toàn và riêng tư."
            : "Keep your data safe and private.",
          href: "#",
        },
        {
          icon: "mobile-check",
          title: isVi ? "Tương thích eSIM" : "eSIM Compatibility",
          desc: isVi
            ? "Kiểm tra thiết bị có hỗ trợ eSIM không."
            : "Find out if your device is eSIM compatible.",
          href: "#",
        },
      ],
      col2Label: "Tools",
      col2: [
        {
          icon: "calculator",
          title: isVi ? "Tính dữ liệu sử dụng" : "Data Usage Calculator",
          desc: isVi
            ? "Ước tính dữ liệu bạn cần."
            : "Estimate your data usage.",
          href: isVi ? `/${lang}/cong-cu-tinh-data` : `/${lang}/data-calculator`,
        },
      ],
      explore: [
        {
          title: isVi ? "Tính năng bảo mật" : "Security features",
          desc: isVi
            ? "Khám phá tính năng bảo vệ kỹ thuật số của Esim.vn."
            : "Discover Esim.vn's built-in digital protection.",
          href: "#",
          image:
            "https://sb.nordcdn.com/m/7bf573d226cb4b2d/original/mega-menu-explore-security-features.png",
          imageAlt: "A man uses Esim.vn's built-in digital protection.",
        },
        {
          title: isVi ? "eSIM cho Doanh nghiệp" : "eSIM for Business",
          desc: isVi
            ? "Quản lý tất cả gói eSIM của đội nhóm."
            : "Manage all your team's eSIM plans.",
          href: "#",
          image:
            "https://sb.nordcdn.com/m/37ec43195ff7cbbd/original/mega-menu-explore-b2b-admin-panel.png",
          imageAlt:
            "A smiling woman using her phone, which mirrors the Esim.vn business dashboard.",
        },
        {
          title: "Ultra Plan",
          desc: isVi
            ? "Dữ liệu không giới hạn, hoàn 8% tín dụng và nhiều ưu đãi."
            : "Unlimited data, 8% back in credits, and extra perks.",
          href: "#",
          image:
            "https://sb.nordcdn.com/m/681452996b3d756b/original/mega-menu-explore-ultra-plan.png",
          imageAlt: "The Ultra plan tab on the Esim.vn app.",
        },
      ],
      bottomLeft: {
        icon: true,
        text: isVi ? "eSIM là gì?" : "What is an eSIM?",
        href: "#",
      },
      bottomRight: {
        text: isVi ? "Tải ứng dụng" : "Download App",
        href: "#",
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
          href: isVi ? `/${lang}/esim-la-gi` : `/${lang}/what-is-esim`,
        },
        {
          icon: "pen",
          title: "Blog",
          desc: isVi
            ? "Đọc bài viết, hướng dẫn và cập nhật sản phẩm."
            : "Read articles, guides, and product updates.",
          href: "#",
        },
        {
          icon: "circle-user",
          title: isVi ? "Về chúng tôi" : "About Us",
          desc: isVi
            ? "Tìm hiểu thêm về chúng tôi."
            : "Learn more about who we are and what we do.",
          href: isVi ? `/${lang}/gioi-thieu` : `/${lang}/about-us`,
        },
        {
          icon: "globe",
          title: isVi ? "Báo chí" : "Press Area",
          desc: isVi
            ? "Tin tức mới nhất và tài nguyên thương hiệu."
            : "The latest news, insights, and brand assets.",
          href: "#",
        },
      ],
      col2: [
        {
          icon: "network-wired",
          title: isVi ? "Chương trình đối tác" : "Affiliate Program",
          desc: isVi
            ? "Hợp tác và kiếm thu nhập qua giới thiệu."
            : "Partner with us and earn through referrals.",
          href: "#",
        },
        {
          icon: "message-dots",
          title: isVi ? "Đánh giá Esim.vn" : "Esim.vn Reviews",
          desc: isVi
            ? "Xem mọi người nói gì về chúng tôi!"
            : "Find out what people are saying about us!",
          href: "#",
        },
        {
          icon: "seedling",
          title: isVi ? "Tuyển dụng" : "Careers",
          desc: isVi
            ? "Khám phá vị trí tuyển dụng và gia nhập đội ngũ."
            : "Explore open roles and join the team.",
          href: "#",
        },
      ],
      explore: [
        {
          title: isVi ? "Tính năng bảo mật" : "Security features",
          desc: isVi
            ? "Khám phá tính năng bảo vệ kỹ thuật số của Esim.vn."
            : "Discover Esim.vn's built-in digital protection.",
          href: "#",
          image:
            "https://sb.nordcdn.com/m/7bf573d226cb4b2d/original/mega-menu-explore-security-features.png",
          imageAlt: "A man uses Esim.vn's built-in digital protection.",
        },
        {
          title: isVi ? "Tính dữ liệu sử dụng" : "Data usage calculator",
          desc: isVi
            ? "Tìm hiểu bạn cần bao nhiêu dữ liệu cho chuyến đi."
            : "Find out how much data you'll need on your trip.",
          href: isVi ? `/${lang}/cong-cu-tinh-data` : `/${lang}/data-calculator`,
          image:
            "https://sb.nordcdn.com/m/6c224dbf48f13441/original/mega-menu-explore-data-usage-calculator.png",
          imageAlt: "A woman uses Esim.vn's data usage calculator.",
        },
        {
          title: "Ultra Plan",
          desc: isVi
            ? "Dữ liệu không giới hạn, hoàn 8% tín dụng và nhiều ưu đãi."
            : "Unlimited data, 8% back in credits, and extra perks.",
          href: "#",
          image:
            "https://sb.nordcdn.com/m/681452996b3d756b/original/mega-menu-explore-ultra-plan.png",
          imageAlt: "The Ultra plan tab on the Esim.vn app.",
        },
      ],
      bottomLeft: {
        icon: true,
        text: isVi
          ? "Thiết bị của bạn có tương thích eSIM không?"
          : "Is your device eSIM compatible?",
        href: "#",
      },
      bottomRight: {
        text: isVi ? "Tải ứng dụng" : "Download App",
        href: "#",
      },
    },
    offers: {
      col1: [
        {
          icon: "thumbs-up",
          title: isVi ? "Giới thiệu bạn bè" : "Refer a Friend",
          desc: isVi
            ? "Chia sẻ Esim.vn với bạn bè và nhận thưởng."
            : "Share Esim.vn with friends and earn rewards.",
          href: "#",
        },
        {
          icon: "badge-percent",
          title: isVi ? "Giảm giá sinh viên" : "Student Discount",
          desc: isVi
            ? "Tiết kiệm hơn với giá đặc biệt cho sinh viên."
            : "Save more with special pricing for students.",
          href: "#",
        },
        {
          icon: "tag",
          title: isVi ? "Mã giảm giá Esim.vn" : "Esim.vn Coupons",
          desc: isVi
            ? "Nhận ưu đãi tốt nhất và tiết kiệm dữ liệu eSIM!"
            : "Get the best deals and save on eSIM data!",
          href: "#",
        },
      ],
      col2: [
        {
          icon: "ticket",
          title: isVi ? "Voucher Esim.vn" : "Esim.vn vouchers",
          desc: isVi
            ? "Nhận voucher Esim.vn, sử dụng trong 12 tháng."
            : "Get a Esim.vn voucher, use within 12 months.",
          href: "#",
        },
      ],
      explore: [
        {
          title: isVi ? "Tính năng bảo mật" : "Security features",
          desc: isVi
            ? "Khám phá tính năng bảo vệ kỹ thuật số của Esim.vn."
            : "Discover Esim.vn's built-in digital protection.",
          href: "#",
          image:
            "https://sb.nordcdn.com/m/7bf573d226cb4b2d/original/mega-menu-explore-security-features.png",
          imageAlt: "A man uses Esim.vn's built-in digital protection.",
        },
        {
          title: isVi ? "Tính dữ liệu sử dụng" : "Data usage calculator",
          desc: isVi
            ? "Tìm hiểu bạn cần bao nhiêu dữ liệu cho chuyến đi."
            : "Find out how much data you'll need on your trip.",
          href: `/${lang}/data-calculator`,
          image:
            "https://sb.nordcdn.com/m/6c224dbf48f13441/original/mega-menu-explore-data-usage-calculator.png",
          imageAlt: "A woman uses Esim.vn's data usage calculator.",
        },
        {
          title: "Ultra Plan",
          desc: isVi
            ? "Dữ liệu không giới hạn, hoàn 8% tín dụng và nhiều ưu đãi."
            : "Unlimited data, 8% back in credits, and extra perks.",
          href: "#",
          image:
            "https://sb.nordcdn.com/m/681452996b3d756b/original/mega-menu-explore-ultra-plan.png",
          imageAlt: "The Ultra plan tab on the Esim.vn app.",
        },
      ],
      bottomLeft: {
        icon: true,
        text: isVi ? "eSIM là gì?" : "What is an eSIM?",
        href: "#",
      },
      bottomRight: {
        text: isVi ? "Tải ứng dụng" : "Download App",
        href: "#",
      },
    },
    help: {
      col1: [
        {
          icon: "help-circle",
          title: isVi ? "Bắt đầu" : "Getting Started",
          desc: isVi
            ? "Hướng dẫn nhanh sử dụng ứng dụng Esim.vn eSIM."
            : "A quick guide to using the Esim.vn eSIM app.",
          href: "#",
        },
        {
          icon: "globe",
          title: isVi ? "Trung tâm trợ giúp" : "Help Center",
          desc: isVi
            ? "Duyệt hướng dẫn và tài nguyên hỗ trợ."
            : "Browse guides and support resources.",
          href: "#",
        },
        {
          icon: "triangle-alert",
          title: isVi ? "Khắc phục sự cố" : "Troubleshooting",
          desc: isVi
            ? "Sửa lỗi thường gặp với hướng dẫn từng bước."
            : "Fix common issues with step-by-step help.",
          href: "#",
        },
      ],
      col2: [
        {
          icon: "message-dots",
          title: "FAQ",
          desc: isVi
            ? "Tìm câu trả lời cho các câu hỏi phổ biến nhất về Esim.vn."
            : "Find answers to the most common questions about Esim.vn.",
          href: "#",
        },
      ],
      explore: [
        {
          title: isVi ? "Tính năng bảo mật" : "Security features",
          desc: isVi
            ? "Khám phá tính năng bảo vệ kỹ thuật số của Esim.vn."
            : "Discover Esim.vn's built-in digital protection.",
          href: "#",
          image:
            "https://sb.nordcdn.com/m/7bf573d226cb4b2d/original/mega-menu-explore-security-features.png",
          imageAlt: "A man uses Esim.vn's built-in digital protection.",
        },
        {
          title: isVi ? "Tính dữ liệu sử dụng" : "Data usage calculator",
          desc: isVi
            ? "Tìm hiểu bạn cần bao nhiêu dữ liệu cho chuyến đi."
            : "Find out how much data you'll need on your trip.",
          href: `/${lang}/data-calculator`,
          image:
            "https://sb.nordcdn.com/m/6c224dbf48f13441/original/mega-menu-explore-data-usage-calculator.png",
          imageAlt: "A woman uses Esim.vn's data usage calculator.",
        },
        {
          title: "Ultra Plan",
          desc: isVi
            ? "Dữ liệu không giới hạn, hoàn 8% tín dụng và nhiều ưu đãi."
            : "Unlimited data, 8% back in credits, and extra perks.",
          href: "#",
          image:
            "https://sb.nordcdn.com/m/681452996b3d756b/original/mega-menu-explore-ultra-plan.png",
          imageAlt: "The Ultra plan tab on the Esim.vn app.",
        },
      ],
      bottomLeft: {
        icon: true,
        text: isVi ? "eSIM là gì?" : "What is an eSIM?",
        href: "#",
      },
      bottomRight: {
        text: isVi ? "Tải ứng dụng" : "Download App",
        href: "#",
      },
    },
  };
}

const NAV_ITEMS = ["product", "resources", "offers", "help"] as const;

/* ===== Main Navbar ===== */

export function Navbar({ lang, dict }: NavbarProps) {
  const pathname = usePathname();
  const isLandingPage = pathname === `/${lang}` || pathname === `/${lang}/`;
  const [searchOpen, setSearchOpen] = useState(false);
  const [announcementVisible, setAnnouncementVisible] = useState(true);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [destinationsOpen, setDestinationsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const menuData = getMenuData(lang);

  const handleLangChange = useCallback((value: string) => {
    window.location.href = `/${value}`;
  }, []);

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

  return (
    <>
      {/* ===== Announcement Bar ===== */}
      {announcementVisible && isLandingPage && (
        <div className="relative bg-bg-dark text-text-primary-on-color overflow-hidden">
          <div className="px-6 min-w-full flex justify-between items-center md:gap-3">
            <div className="flex py-3 md:justify-center items-center w-full md:gap-3">
              <div className="hidden md:flex items-center gap-3">
                <UserPlus className="w-4 h-4 text-text-primary-on-color shrink-0" />
                <p className="body-sm text-text-primary-on-color">
                  {dict.announcement}
                </p>
                <Link
                  href="#"
                  className="inline-block text-text-primary-on-color border-md border-[rgba(255,255,255,0.3)] hover:bg-bg-secondary hover:text-text-primary rounded-full transition-colors body-sm-medium px-6 py-[5.5px]"
                >
                  {dict.announcementCta}
                </Link>
              </div>
              <div className="flex md:hidden flex-col gap-2 w-full pr-8">
                <div className="flex items-center gap-2">
                  <UserPlus className="w-4 h-4 shrink-0 text-text-primary-on-color" />
                  <p className="body-sm text-text-primary-on-color">
                    {dict.announcement}
                  </p>
                </div>
                <Link
                  href="#"
                  className="w-full text-center text-text-primary-on-color border-md border-[rgba(255,255,255,0.3)] hover:bg-bg-secondary hover:text-text-primary rounded-full transition-colors body-sm-medium px-6 py-[5.5px]"
                >
                  {dict.announcementCta}
                </Link>
              </div>
            </div>
            <button
              onClick={() => setAnnouncementVisible(false)}
              className="flex h-5 md:h-6 ml-auto md:ml-0 max-md:absolute top-3 right-6 cursor-pointer"
              aria-label="Close announcement"
            >
              <X className="w-5 h-5 md:w-6 md:h-6 text-[rgba(255,255,255,0.6)] hover:text-white transition-colors" />
            </button>
          </div>
        </div>
      )}

      {/* ===== Main Header ===== */}
      <header
        className="z-40 top-0 sticky bg-[rgba(255,255,255,0.1)] backdrop-blur-[98px] [-webkit-backdrop-filter:blur(98px)]"
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
              <Link href={`/${lang}`} className="block">
                <SailyLogo />
                <span className="sr-only">Esim.vn</span>
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
                        "w-3 h-3 text-text-tertiary transition-transform duration-200",
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
                  "hidden lg:flex items-center gap-2 px-6 py-[5.5px] text-text-primary border-md border-text-primary rounded-full body-sm-medium cursor-pointer transition-all duration-200 hover:bg-bg-dark hover:text-text-primary-on-color hover:border-bg-dark group",
                  destinationsOpen && "bg-bg-dark text-text-primary-on-color border-bg-dark"
                )}
              >
                <Search className={cn(
                  "w-3 h-3 transition-colors group-hover:text-text-primary-on-color",
                  destinationsOpen && "text-text-primary-on-color"
                )} />
                {lang === "vi" ? "Điểm đến" : "Destinations"}
              </button>

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
            </div>

            {/* Mobile Menu */}
            <div className="flex ml-6 lg:hidden">
              <MobileSidebar
                lang={lang}
                dict={dict}
                onSearchOpen={() => setSearchOpen(true)}
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
            onClose={() => setDestinationsOpen(false)}
          />
        )}
      </header>

      {/* Destination Search Modal */}
      <DestinationSearch
        lang={lang}
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        placeholder={dict.searchPlaceholder}
      />
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
    <div className="hidden lg:block absolute w-full px-6 top-full left-0 rounded-b-md bg-bg-secondary shadow-[0_8px_12px_-6px_rgba(149,157,165,0.2)] z-50 animate-fade-in">
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
            className="inline-block text-text-primary-on-color bg-bg-dark hover:bg-bg-accent-hover border-md border-bg-dark rounded-full transition-colors body-sm-medium px-6 py-[5.5px]"
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
      className="rounded-sm w-full block group p-3 hover:bg-bg-primary transition-colors duration-200"
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
  onSearchOpen,
  onLangChange,
}: {
  lang: Locale;
  dict: Record<string, any>;
  onSearchOpen: () => void;
  onLangChange: (val: string) => void;
}) {
  const [open, setOpen] = useState(false);

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
        <Dialog.Content className="fixed top-0 right-0 h-dvh z-[9999] w-full bg-bg-secondary overflow-y-auto scrollbar-none focus:outline-none data-[state=open]:animate-fade-in">
          <div className="flex flex-col grow h-full justify-between">
            <div className="px-4">
              {/* Header */}
              <div className="flex justify-between items-center mb-4 sticky top-0 z-50 py-4 bg-bg-secondary h-14">
                <Link href={`/${lang}`} onClick={() => setOpen(false)}>
                  <SailyLogo />
                </Link>
                <Dialog.Close asChild>
                  <button className="w-6 h-6 flex items-center justify-center cursor-pointer" aria-label="Close">
                    <X className="w-4 h-4" />
                  </button>
                </Dialog.Close>
              </div>

              {/* Search */}
              <div className="relative w-full mb-8">
                <input
                  placeholder={lang === "vi" ? "Bạn đang đi du lịch ở đâu?" : "Where are you travelling to?"}
                  className="body-md bg-bg-primary outline-none appearance-none w-full leading-relaxed py-[12.5px] pl-4 pr-12 text-text-primary placeholder-text-tertiary border-md border-border-secondary focus:border-border-focus transition-colors rounded-full cursor-pointer"
                  type="text"
                  readOnly
                  onClick={() => {
                    setOpen(false);
                    setTimeout(() => onSearchOpen(), 200);
                  }}
                />
                <div className="absolute top-1/2 -translate-y-1/2 right-2 flex items-center justify-center rounded-full h-8 w-8 bg-bg-dark">
                  <Search className="w-3 h-3 text-text-primary-on-color" />
                </div>
              </div>

              {/* Nav Items */}
              <div className="space-y-1">
                {NAV_ITEMS.map((item) => (
                  <button
                    key={item}
                    className="flex items-center justify-between w-full px-4 py-3 body-md-medium text-text-primary rounded-lg cursor-pointer hover:bg-bg-primary transition-colors duration-200"
                  >
                    <span className="flex items-center gap-2">
                      {dict[item]}
                      {item === "product" && (
                        <span className="text-center whitespace-nowrap rounded-full inline-block border-md border-border-focus text-text-primary py-0.5 px-2 body-2xs-medium">
                          {dict.new}
                        </span>
                      )}
                    </span>
                    <ChevronDown className="w-4 h-4 -rotate-90 text-text-tertiary" />
                  </button>
                ))}
              </div>

              {/* Language */}
              <div className="relative mt-4 px-4 py-3 rounded-lg cursor-pointer hover:bg-bg-primary transition-colors">
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
            <div className="p-4 space-y-3 border-t border-border-primary mt-auto">
              <Link
                href="#"
                className="block w-full text-center px-5 py-3 bg-bg-accent text-text-primary-on-color body-md-medium rounded-full cursor-pointer hover:bg-bg-accent-hover transition-colors"
                onClick={() => setOpen(false)}
              >
                {dict.downloadApp}
              </Link>
              <Link
                href="#"
                className="block w-full text-center px-5 py-3 border-md border-border-focus text-text-primary body-md-medium rounded-full cursor-pointer hover:bg-bg-primary transition-colors"
                onClick={() => setOpen(false)}
              >
                {dict.getStarted}
              </Link>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
