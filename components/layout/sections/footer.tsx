import Link from "next/link";

interface FooterSectionProps {
  dict: Record<string, any>;
}

const socialLinks = [
  { name: "Facebook", src: "https://sb.nordcdn.com/m/73b0007dac464eb4/original/facebook.svg", href: "https://www.facebook.com/sailyservice" },
  { name: "X (Twitter)", src: "https://sb.nordcdn.com/m/3cffb132be50069/original/x-twitter.svg", href: "https://x.com/sailyworld" },
  { name: "LinkedIn", src: "https://sb.nordcdn.com/m/7479eac8a4f6a155/original/linkedin.svg", href: "https://www.linkedin.com/company/sailyworld/" },
  { name: "YouTube", src: "https://sb.nordcdn.com/m/544926c91d4179c6/original/youtube.svg", href: "https://www.youtube.com/@saily_service" },
  { name: "Instagram", src: "https://sb.nordcdn.com/m/327ee6481264b8e0/original/instagram.svg", href: "https://www.instagram.com/sailyworld" },
  { name: "Reddit", src: "https://sb.nordcdn.com/m/7e0fac0feb703767/original/Reddit.svg", href: "https://www.reddit.com/r/saily/" },
];

const paymentIcons = [
  { name: "Apple Pay", src: "https://sb.nordcdn.com/m/3a97dd853ad8a7a5/original/apple-pay.svg" },
  { name: "Google Pay", src: "https://sb.nordcdn.com/m/4472df3ff7fad3db/original/google-pay.svg" },
  { name: "Visa", src: "https://sb.nordcdn.com/m/7053db2e1118cc8/original/visa.svg" },
  { name: "Mastercard", src: "https://sb.nordcdn.com/m/7f0ece0e4ee50365/original/mastercard.svg" },
  { name: "Amex", src: "https://sb.nordcdn.com/m/7f041c7528221650/original/amex.svg" },
  { name: "Discover", src: "https://sb.nordcdn.com/m/669348c02827ab8f/original/16.svg" },
  { name: "UnionPay", src: "https://sb.nordcdn.com/m/7fee670fbbf9292b/original/union-pay.svg" },
  { name: "JCB", src: "https://sb.nordcdn.com/m/783f5e58e6359300/original/jcb.svg" },
];

export function FooterSection({ dict }: FooterSectionProps) {
  const columns = [
    { title: dict.popularDestinations.title, links: dict.popularDestinations.links },
    { title: dict.saily.title, links: dict.saily.links },
    { title: dict.esim.title, links: dict.esim.links },
    { title: dict.helpLinks.title, links: dict.helpLinks.links },
    { title: dict.followUs.title, links: dict.followUs.links },
  ];

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
                alt="Esim.vn logo"
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
              rel="noopener noreferrer nofollow"
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
              rel="noopener noreferrer nofollow"
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

        {/* Footer Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-x-8 gap-y-6 md:gap-y-8 pb-8">
          {columns.map((col, i) => (
            <div key={i} className="flex flex-col">
              <p className="body-sm-bold text-text-primary mb-4">{col.title}</p>
              <div className="flex flex-col gap-y-3">
                {col.links.map((link: string, j: number) => (
                  <a
                    key={j}
                    href="#"
                    className="body-sm text-text-secondary hover:underline inline-flex items-center"
                  >
                    {link}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Social Links */}
        <div className="flex flex-wrap gap-4 pb-8">
          {socialLinks.map((social) => (
            <a
              key={social.name}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="hover:opacity-80 transition-opacity"
              aria-label={social.name}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={social.src}
                alt={social.name.toLowerCase()}
                width={24}
                height={24}
                loading="lazy"
                style={{ color: "transparent" }}
              />
            </a>
          ))}
        </div>

        {/* Payment Methods */}
        <div className="flex flex-wrap gap-3 pb-8">
          {paymentIcons.map((payment) => (
            <div key={payment.name} className="flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={payment.src}
                alt={payment.name.toLowerCase()}
                width={40}
                height={26}
                loading="lazy"
                style={{ color: "transparent" }}
              />
            </div>
          ))}
        </div>

        {/* Legal */}
        <div className="border-t border-border-primary pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="body-xs text-text-tertiary">{dict.legal.copyright}</p>
          <div className="flex flex-wrap gap-4">
            {dict.legal.links.map((link: string, i: number) => (
              <a
                key={i}
                href="#"
                className="body-xs text-text-tertiary hover:text-text-secondary transition-colors"
              >
                {link}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
