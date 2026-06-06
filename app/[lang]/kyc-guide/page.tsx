import { KycGuideContent, KycGuideBackButton } from "@/components/layout/sections/kyc-guide";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { getDictionary } from "@/lib/dictionaries";
import type { KycRegionKey } from "@/components/layout/sections/kyc-guide";
import type { Locale } from "@/lib/i18n-config";
import type { Metadata } from "next";

const VALID_REGIONS: KycRegionKey[] = ["hk", "tw", "hkmo"];

interface KycGuidePageProps {
  params: { lang: Locale };
  searchParams?: { region?: string };
}

export function generateMetadata({ params }: KycGuidePageProps): Metadata {
  const title =
    params.lang === "en"
      ? "eKYC registration guide — esim.vn"
      : "Hướng dẫn xác thực danh tính eKYC — esim.vn";
  const description =
    params.lang === "en"
      ? "Step-by-step guide to register identity verification (eKYC) for HK / Taiwan / Macau eSIM."
      : "Hướng dẫn chi tiết các bước đăng ký xác thực danh tính (eKYC) cho eSIM Hồng Kông / Đài Loan / Macau.";
  return {
    title,
    description,
    robots: { index: false, follow: true },
  };
}

export default async function KycGuidePage({ params, searchParams }: KycGuidePageProps) {
  const dict = await getDictionary(params.lang);
  const raw = searchParams?.region;
  const initialRegion: KycRegionKey =
    raw && (VALID_REGIONS as string[]).includes(raw) ? (raw as KycRegionKey) : "hk";

  return (
    <main role="main">
      <Breadcrumb
        items={[{ label: dict.breadcrumb.kycGuide }]}
        lang={params.lang}
      >
        <KycGuideBackButton />
      </Breadcrumb>
      <KycGuideContent initialRegion={initialRegion} />
    </main>
  );
}
