import { InstallGuide } from "@/components/layout/sections/install-guide";
import { IG_DESKTOP_HTML } from "@/components/layout/sections/install-guide/design/ig-desktop-html";
import { IG_MOBILE_HTML } from "@/components/layout/sections/install-guide/design/ig-mobile-html";
import { IG_DESKTOP_HTML as IG_DESKTOP_HTML_EN } from "@/components/layout/sections/install-guide/design/ig-desktop-html.en";
import { IG_MOBILE_HTML as IG_MOBILE_HTML_EN } from "@/components/layout/sections/install-guide/design/ig-mobile-html.en";
import { FooterSection } from "@/components/layout/sections/footer";
import { getCmsSeoUrlForPage } from "@/lib/cms-seo-url";
import { getDictionary } from "@/lib/dictionaries";
import { getSeoMetadata } from "@/lib/seo";
import { getLocale } from "next-intl/server";
import type { Locale } from "@/lib/i18n-config";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const locale = (await getLocale()) as Locale;
  const fallback =
    locale === "en"
      ? {
          title: "eSIM Setup Guide for iOS and Android – esim.vn",
          description: "Install eSIM on iPhone (iOS) and Android, step by step",
        }
      : {
          title: "Hướng dẫn cài đặt eSIM trên thiết bị iOS và Android – esim.vn",
          description:
            "Hướng dẫn cài đặt eSIM du lịch esim.vn trên iPhone, Samsung, Google Pixel và Android: bấm nút cài đặt nhanh, quét mã QR hoặc nhập thủ công. Kèm cách kích hoạt khi đến nơi và khắc phục sự cố.",
        };
  return getSeoMetadata(getCmsSeoUrlForPage("/install-guide", locale), fallback);
}

export default async function InstallGuidePage() {
  const locale = (await getLocale()) as Locale;
  const dict = await getDictionary(locale);
  return (
    // The design brings its own <main> (one per layout; the hidden one is out
    // of the accessibility tree), so the page wrapper is a plain div.
    <div>
      {/* Markup in the page's language (vande #036); only it reaches the client. */}
      <InstallGuide
        lang={locale}
        desktopHtml={locale === "en" ? IG_DESKTOP_HTML_EN : IG_DESKTOP_HTML}
        mobileHtml={locale === "en" ? IG_MOBILE_HTML_EN : IG_MOBILE_HTML}
      />
      <FooterSection dict={dict.footer} lang={locale} />
    </div>
  );
}
