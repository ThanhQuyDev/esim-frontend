import { KycGuideContent, KycGuideBackButton } from "@/components/layout/sections/kyc-guide";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { getDictionary } from "@/lib/dictionaries";
import { getLocale } from "next-intl/server";
import type { KycRegionKey } from "@/components/layout/sections/kyc-guide";
import type { Locale } from "@/lib/i18n-config";
import type { Metadata } from "next";

const VALID_REGIONS: KycRegionKey[] = ["hk", "tw", "hkmo"];

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const title =
    locale === "en"
      ? "eKYC registration guide — esim.vn"
      : "Hướng dẫn xác thực danh tính eKYC — esim.vn";
  const description =
    locale === "en"
      ? "Step-by-step guide to register identity verification (eKYC) for HK / Taiwan / Macau eSIM."
      : "Hướng dẫn chi tiết các bước đăng ký xác thực danh tính (eKYC) cho eSIM Hồng Kông / Đài Loan / Macau.";
  return {
    title,
    description,
    robots: { index: false, follow: true },
  };
}

export default async function KycGuidePage({
  searchParams,
}: {
  searchParams?: { region?: string };
}) {
  const locale = (await getLocale()) as Locale;
  const dict = await getDictionary(locale);
  const raw = searchParams?.region;
  const initialRegion: KycRegionKey =
    raw && (VALID_REGIONS as string[]).includes(raw) ? (raw as KycRegionKey) : "hk";

  return (
    <main role="main">
      <Breadcrumb
        items={[{ label: dict.breadcrumb.kycGuide }]}
        lang={locale}
        className="max-w-[880px] mx-auto sm:px-6 px-4"
      >
        <KycGuideBackButton lang={locale} />
      </Breadcrumb>
      <KycGuideContent initialRegion={initialRegion} lang={locale} />
    </main>
  );
}
