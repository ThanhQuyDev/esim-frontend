import Image from "next/image";
import { ChevronRight } from "lucide-react";

interface ReferFriendBannerProps {
  dict: Record<string, any>;
}

export function ReferFriendBanner({ dict }: ReferFriendBannerProps) {
  return (
    <section className="py-16">
      <div className="mx-4 sm:mx-auto">
        <div className="container mx-auto">
          <div className="flex flex-col lg:flex-row rounded-sm md:rounded-md lg:rounded-lg overflow-hidden bg-bg-brand-yellow">
            <div className="flex-1 flex items-center">
              <div className="md:p-16 px-6 py-8 w-full flex flex-col gap-6 lg:gap-8">
                <h2 className="heading-lg text-text-primary">{dict.title}</h2>
                <p className="body-md text-text-secondary">{dict.description || ""}</p>
                <div>
                  <a
                    role="button"
                    href="#"
                    className="inline-block text-text-primary border border-text-primary rounded-full px-7 py-[11px] body-md-medium hover:bg-bg-accent hover:text-text-primary-on-color hover:border-bg-accent transition-colors"
                  >
                    {dict.cta}
                  </a>
                </div>
              </div>
            </div>
            <div className="flex flex-1">
              <div className="mx-auto flex items-end lg:items-center">
                {/* Mobile/Tablet < lg */}
                <div className="block lg:hidden">
                  <Image
                    alt="A group of people enjoying a US$5 Saily credit after referring a friend."
                    src="https://sb.nordcdn.com/m/679dd975658e23c5/original/refer-a-friend-xs.png"
                    width={800}
                    height={414}
                    loading="lazy"
                    style={{ color: "transparent" }}
                  />
                </div>
                {/* Desktop lg+ */}
                <div className="hidden lg:block">
                  <Image
                    alt="A group of people enjoying a US$5 Saily credit after referring a friend."
                    src="https://sb.nordcdn.com/m/21d0b978993f51f3/original/refer-a-friend-xl.png"
                    width={700}
                    height={800}
                    loading="lazy"
                    style={{ color: "transparent" }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
