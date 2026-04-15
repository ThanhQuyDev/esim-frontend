import Image from "next/image";
import { Star } from "lucide-react";

interface DownloadAppSectionProps {
  dict: Record<string, any>;
}

export function DownloadAppSection({ dict }: DownloadAppSectionProps) {
  return (
    <section className="py-16">
      <div className="mx-4 sm:mx-auto">
        <div className="container mx-auto">
          <div className="grid sm:gap-x-16 gap-y-8 grid-cols-1 md:grid-cols-2">
            {/* Left Content */}
            <div className="h-full flex flex-col justify-center gap-y-4">
              {/* Trustpilot */}
              <div className="body-md-medium text-text-disabled">
                <a
                  href="https://www.trustpilot.com/review/saily.com"
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="inline-flex gap-2 items-start"
                >
                  <div className="flex gap-2 items-baseline">
                    <p className="body-md-medium text-text-primary">{dict.trustpilot.label}</p>
                    <p className="body-sm text-text-primary">{dict.trustpilot.rating} out of {dict.trustpilot.total}</p>
                  </div>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    alt="Trustpilot"
                    src="https://sb.nordcdn.com/m/790e17b32e10d831/original/trustpilot-logo.svg"
                    width={98}
                    height={21}
                    loading="lazy"
                    style={{ color: "transparent" }}
                  />
                </a>
              </div>

              {/* Title & Description */}
              <div className="flex flex-col justify-start gap-y-6">
                <h2 className="heading-xl text-text-primary">{dict.title}</h2>
                <p className="body-md text-text-secondary">{dict.subtitle}</p>

                {/* Store Buttons */}
                <div className="flex flex-row items-start gap-x-4">
                  {/* App Store */}
                  <div className="flex flex-col gap-y-4">
                    <a
                      href="https://saily.onelink.me/ymzx/appstore"
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                      className="inline-block"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        alt="app store"
                        src="https://sb.nordcdn.com/m/3bd4c58600abc36b/original/app-store.svg"
                        width={163}
                        height={48}
                        loading="lazy"
                        style={{ color: "transparent" }}
                      />
                    </a>
                    <div className="flex flex-col gap-y-1">
                      <div className="flex flex-row items-center gap-x-2">
                        <Star className="w-4 h-4 fill-current text-text-primary" />
                        <p className="body-sm-medium text-text-primary">★ {dict.appStore.rating}</p>
                      </div>
                      <p className="body-xs text-text-tertiary">{dict.appStore.label}</p>
                    </div>
                  </div>

                  {/* Google Play */}
                  <div className="flex flex-col gap-y-4">
                    <a
                      href="https://saily.onelink.me/ymzx/android"
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                      className="inline-block"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        alt="google play"
                        src="https://sb.nordcdn.com/m/61c12f9617ed35b4/original/google-play.svg"
                        width={163}
                        height={48}
                        loading="lazy"
                        style={{ color: "transparent" }}
                      />
                    </a>
                    <div className="flex flex-col gap-y-1">
                      <div className="flex flex-row items-center gap-x-2">
                        <Star className="w-4 h-4 fill-current text-text-primary" />
                        <p className="body-sm-medium text-text-primary">★ {dict.googlePlay.rating}</p>
                      </div>
                      <p className="body-xs text-text-tertiary">{dict.googlePlay.label}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right - Phone Images */}
            <div>
              {/* Mobile */}
              <div className="block md:hidden">
                <Image
                  alt="A hand holds a phone with the Saily app open"
                  src="https://sb.nordcdn.com/m/18f01ad59d199b85/original/download-asset-xs.png"
                  width={555}
                  height={555}
                  loading="lazy"
                  style={{ color: "transparent" }}
                />
              </div>
              {/* Desktop */}
              <div className="hidden md:block">
                <Image
                  alt="A QR code to download the Saily eSIM app."
                  src="https://sb.nordcdn.com/m/2116ba3676cc8b98/original/download-asset-xl.png"
                  width={555}
                  height={555}
                  loading="lazy"
                  style={{ color: "transparent" }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
