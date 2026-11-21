import Link from "next/link";
import { getLocale } from "next-intl/server";
import type { Metadata } from "next";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { FooterSection } from "@/components/layout/sections/footer";
import {
  LEGAL_POLICIES,
  getPolicyHref,
} from "@/components/layout/sections/legal";
import { getDictionary } from "@/lib/dictionaries";
import type { Locale } from "@/lib/i18n-config";

/**
 * The legal index, /phap-ly and /en/legal (vande-2011 #043): it was a 404,
 * though every policy's breadcrumb pointed at it.
 */
const COPY = {
  vi: {
    title: "Chính sách pháp lý",
    lead: "Các chính sách áp dụng khi bạn mua và sử dụng eSIM tại esim.vn. Chọn một chính sách để xem chi tiết.",
    read: "Xem chi tiết",
    blurb: {
      "chinh-sach-hoan-tien": "Khi nào được hoàn tiền, cách gửi yêu cầu và thời gian xử lý.",
      "chinh-sach-giao-hang": "eSIM được gửi qua email và tài khoản ngay sau khi thanh toán.",
      "dieu-khoan-dieu-kien": "Điều kiện sử dụng dịch vụ và quyền, nghĩa vụ của các bên.",
      "chinh-sach-bao-mat": "Thông tin nào được thu thập, dùng vào việc gì và cách bảo vệ.",
    } as Record<string, string>,
  },
  en: {
    title: "Legal policies",
    lead: "The policies that apply when you buy and use an eSIM from esim.vn. Choose one to read it in full.",
    read: "Read policy",
    blurb: {
      "chinh-sach-hoan-tien": "When you can get a refund, how to ask for one and how long it takes.",
      "chinh-sach-giao-hang": "Your eSIM is sent by email and to your account right after payment.",
      "dieu-khoan-dieu-kien": "The conditions for using the service, and each party's rights and duties.",
      "chinh-sach-bao-mat": "What information is collected, what it is used for and how it is protected.",
    } as Record<string, string>,
  },
};

export async function generateMetadata(): Promise<Metadata> {
  const locale = (await getLocale()) as Locale;
  const copy = COPY[locale === "en" ? "en" : "vi"];
  return {
    title: `${copy.title} — esim.vn`,
    description: copy.lead,
  };
}

export default async function LegalIndexPage() {
  const locale = (await getLocale()) as Locale;
  const copy = COPY[locale === "en" ? "en" : "vi"];
  const dict = await getDictionary(locale);

  return (
    <main role="main">
      <Breadcrumb items={[{ label: dict.breadcrumb.legal }]} lang={locale} />
      <div className="max-w-[1168px] mx-auto px-4 sm:px-6 py-10">
        <h1 className="heading-lg text-text-primary">{copy.title}</h1>
        <p className="body-md text-text-secondary mt-3 max-w-[680px]">{copy.lead}</p>
        <ul
          className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4"
          data-testid="legal-index"
        >
          {LEGAL_POLICIES.map((policy) => (
            <li key={policy.slug}>
              <Link
                href={getPolicyHref(policy, locale)}
                className="group flex h-full flex-col rounded-2xl border border-gray-200 bg-white p-5 transition-colors hover:border-text-tertiary"
              >
                <span className="text-lg font-medium leading-snug text-text-primary">
                  {policy.content[locale].title}
                </span>
                <span className="body-sm text-text-secondary mt-2 flex-1">
                  {copy.blurb[policy.slug] ?? ""}
                </span>
                <span className="body-sm-medium text-primary mt-4 group-hover:underline underline-offset-2">
                  {copy.read} →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <FooterSection dict={dict.footer} lang={locale} />
    </main>
  );
}
