import Link from "next/link";
import {
  getFooters,
  pickLocalizedTitle,
  type Footer as ApiFooter,
} from "@/lib/api";
import type { Locale } from "@/lib/i18n-config";

interface FooterLink {
  id?: string;
  label: string;
  href: string;
  iconUrl?: string | null;
}

interface FooterColumn {
  title: string;
  links: FooterLink[];
}

interface FooterSectionProps {
  dict: Record<string, any>;
  footerLinks?: ApiFooter[];
  lang?: Locale;
}

const socialIconMap: Record<string, string> = {
  facebook: "https://sb.nordcdn.com/m/73b0007dac464eb4/original/facebook.svg",
  tiktok: "https://sb.nordcdn.com/m/3cffb132be50069/original/tiktok.svg",
  "x (twitter)": "https://sb.nordcdn.com/m/3cffb132be50069/original/x-twitter.svg",
  twitter: "https://sb.nordcdn.com/m/3cffb132be50069/original/x-twitter.svg",
  instagram: "https://sb.nordcdn.com/m/327ee6481264b8e0/original/instagram.svg",
  youtube: "https://sb.nordcdn.com/m/544926c91d4179c6/original/youtube.svg",
  linkedin: "https://sb.nordcdn.com/m/7479eac8a4f6a155/original/linkedin.svg",
  reddit: "https://sb.nordcdn.com/m/7e0fac0feb703767/original/Reddit.svg",
};

function getSocialIcon(name: string): string | undefined {
  return socialIconMap[name.trim().toLowerCase()];
}

const paymentIcons = [
  { name: "Apple Pay", src: "https://sb.nordcdn.com/m/3a97dd853ad8a7a5/original/apple-pay.svg", width: 38 },
  { name: "Google Pay", src: "https://sb.nordcdn.com/m/4472df3ff7fad3db/original/google-pay.svg", width: 46 },
  { name: "Visa", src: "https://sb.nordcdn.com/m/7053db2e1118cc8/original/visa.svg", width: 36 },
  { name: "Mastercard", src: "https://sb.nordcdn.com/m/7f0ece0e4ee50365/original/mastercard.svg", width: 29 },
  { name: "Amex", src: "https://sb.nordcdn.com/m/7f041c7528221650/original/amex.svg", width: 25 },
  { name: "Discover", src: "https://sb.nordcdn.com/m/669348c02827ab8f/original/16.svg", width: 44 },
  { name: "UnionPay", src: "https://sb.nordcdn.com/m/7fee670fbbf9292b/original/union-pay.svg", width: 38 },
  { name: "JCB", src: "https://sb.nordcdn.com/m/783f5e58e6359300/original/jcb.svg", width: 31 },
];

function getFallbackColumns(dict: Record<string, any>): FooterColumn[] {
  return [
    { title: dict.popularDestinations.title, links: dict.popularDestinations.links },
    { title: dict.saily.title, links: dict.saily.links },
    { title: dict.esim.title, links: dict.esim.links },
    { title: dict.helpLinks.title, links: dict.helpLinks.links },
    { title: dict.followUs.title, links: dict.followUs.links },
  ];
}

function isFollowUsTitle(title: string): boolean {
  const t = title.trim().toLowerCase();
  return (
    t === "follow us" ||
    t === "theo dõi" ||
    t === "theo doi" ||
    t.includes("follow") ||
    t.includes("theo dõi")
  );
}

function getApiFooterColumns(
  footerLinks: ApiFooter[],
  lang: Locale = "en"
): FooterColumn[] {
  const groupedLinks = new Map<string, FooterLink[]>();
  footerLinks.forEach((footerLink) => {
    const label = pickLocalizedTitle(footerLink, lang).trim();
    const href = footerLink.url?.trim();

    if (!label || !href) return;

    const category =
      footerLink.categories?.trim() || (lang === "vi" ? "Liên kết" : "Links");
    const links = groupedLinks.get(category) ?? [];

    links.push({
      id: footerLink.id,
      label,
      href,
      iconUrl: footerLink.iconUrl || null,
    });

    groupedLinks.set(category, links);
  });

  const columns = Array.from(groupedLinks.entries()).map(([title, links]) => ({
    title,
    links,
  }));

  // Always render the "Follow Us" / "Theo dõi" column at the end
  return [
    ...columns.filter((c) => !isFollowUsTitle(c.title)),
    ...columns.filter((c) => isFollowUsTitle(c.title)),
  ];
}

export async function FooterSection({
  dict,
  footerLinks,
  lang = "en",
}: FooterSectionProps) {
  const resolvedFooterLinks = footerLinks ?? (await getFooters({ lang }));
  const apiColumns = getApiFooterColumns(resolvedFooterLinks, lang);
  const columns = apiColumns.length > 0 ? apiColumns : getFallbackColumns(dict);

  return (
    <footer className="px-4 lg:px-16 bg-white text-text-secondary">
      <div className="max-w-[1168px] mx-auto py-12">
        {/* Logo & App Store */}
        <div className="flex flex-wrap flex-col md:flex-row gap-8 justify-between items-start pb-8">
          <div>
            <Link href="/">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo.png"
                alt="esim.vn logo"
                width={100}
                height={45}
                loading="lazy"
                style={{ color: "transparent" }}
              />
            </Link>
          </div>
          <div className="flex flex-row justify-center flex-wrap gap-x-3 gap-y-3">
            <a
              href="https://saily.onelink.me/ymzx/appstore"
              target="_blank"

              className="inline-block"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://sb.nordcdn.com/m/3bd4c58600abc36b/original/app-store.svg"
                alt="app store"
                width={108}
                height={32}
                loading="lazy"
                style={{ color: "transparent" }}
              />
            </a>
            <a
              href="https://saily.onelink.me/ymzx/android"
              target="_blank"

              className="inline-block"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://sb.nordcdn.com/m/61c12f9617ed35b4/original/google-play.svg"
                alt="google play"
                width={108}
                height={32}
                loading="lazy"
                style={{ color: "transparent" }}
              />
            </a>
          </div>
        </div>

        <hr className="pb-8 border-border-primary" />

        {/* Footer Columns - Style 2.1: Bold category titles */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-x-8 gap-y-6 md:gap-y-8 pb-8">
          {columns.map((col, i) => {
            const isFollowCol = isFollowUsTitle(col.title);
            return (
              <div key={i} className="flex flex-col">
                <p className="font-bold text-text-primary mb-4">{col.title}</p>
                <div className="flex flex-col gap-y-3">
                  {col.links.map((link: FooterLink, j: number) => {
                    const linkKey = link.id ?? `${link.href}-${j}`;
                    const isExternal = link.href.startsWith("http");
                    const icon = link.iconUrl || (isFollowCol ? getSocialIcon(link.label) : null);

                    if (isFollowCol && isExternal) {
                      return (
                        <a
                          key={linkKey}
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="body-sm text-text-secondary hover:underline inline-flex items-center gap-2"
                        >
                          {icon && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={icon}
                              alt={link.label.toLowerCase()}
                              width={16}
                              height={16}
                              loading="lazy"
                              style={{ color: "transparent" }}
                            />
                          )}
                          {link.label}
                        </a>
                      );
                    }

                    // All other links
                    return (
                      <Link
                        key={linkKey}
                        href={link.href}
                        className="body-sm text-text-secondary hover:underline inline-flex items-center gap-2"
                      >
                        {icon && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={icon}
                            alt={link.label.toLowerCase()}
                            width={16}
                            height={16}
                            loading="lazy"
                            style={{ color: "transparent" }}
                          />
                        )}
                        {link.label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Footer - Layout 2.3: Restructured copyright, policies, payment */}
        <div className="border-t border-border-primary pt-6">
          <div className="flex flex-col-reverse md:flex-row flex-wrap-reverse justify-between gap-8">
            <p className="body-xs flex flex-wrap gap-6 items-start sm:items-center font-normal scroll-mt-20 xl:scroll-mt-24">
              <span className="font-normal text-text-tertiary">
                © 2026 esim.vn. All rights reserved.
              </span>
              <span className="font-normal text-text-tertiary">
                {lang === "vi"
                  ? "Chịu trách nhiệm nội dung: Nguyễn Đức Thọ"
                  : "Content responsibility: Nguyễn Đức Thọ"}
              </span>
              <span className="flex flex-wrap gap-6 items-center">
                <a
                  className="align-bottom transition-colors ease-out focus-visible:outline-hidden focus-visible:shadow-focus hover:underline inline-block text-text-tertiary"

                  data-ga-slug="Privacy Policy"
                  target="_blank"
                  href="/legal/privacy-policy/"
                >
                  {lang === "vi" ? "Chính sách bảo mật" : "Privacy Policy"}
                </a>
                <a
                  className="align-bottom transition-colors ease-out focus-visible:outline-hidden focus-visible:shadow-focus  hover:underline inline-block text-text-tertiary"

                  data-ga-slug="Terms of Service"
                  target="_blank"
                  href="/legal/terms-of-service/"
                >
                  {lang === "vi" ? "Điều khoản dịch vụ" : "Terms of Service"}
                </a>
                <button
                  className="align-bottom transition-colors ease-out focus-visible:outline-hidden focus-visible:shadow-focus  hover:underline inline-block text-text-tertiary"
                  data-ga-slug="Cookie Preference"
                >
                  {lang === "vi" ? "Quản lý Cookie" : "Cookie Preference"}
                </button>
              </span>
            </p>
            <div>
              <div className="h-full w-full flex group/stack [&>div:empty]:hidden flex-row gap-x-3">
                {paymentIcons.map((payment) => (
                  <div key={payment.name}>
                    <div>
                      <picture>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          alt={payment.name.toLowerCase()}
                          loading="lazy"
                          width={payment.width}
                          height={24}
                          src={payment.src}
                          style={{ color: "transparent" }}
                        />
                      </picture>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
