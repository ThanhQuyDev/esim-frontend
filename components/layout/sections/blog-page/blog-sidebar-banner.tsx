import Image from "next/image";
import Link from "next/link";

export function BlogSidebarBanner({ lang }: { lang: string }) {
  return (
    <div className="sticky top-[92px] shrink-0 hidden lg:block">
      <div className="relative overflow-hidden isolate w-full h-full max-w-[216px] xl:max-w-[268px] rounded-md bg-brand-yellow">
        <img
          alt=""
          loading="lazy"
          width={268}
          height={306}
          className="absolute"
          style={{ color: "transparent" }}
          src="https://sb.nordcdn.com/m/2cee210ed70900e4/original/banner-wave-white.svg"
        />
        <div className="h-full w-full flex group/stack [&>div:empty]:hidden flex-col text-center justify-start items-center gap-y-4 relative p-6 [&>*]:w-full">
          <div>
            <div className="text-primary">
              <p className="heading-md scroll-mt-20 xl:scroll-mt-24">Stay online, wherever life takes you</p>
            </div>
          </div>
          <div>
            <div className="text-secondary">
              <p className="body-md scroll-mt-20 xl:scroll-mt-24">
                Enjoy secure and effortless internet access with the Saily eSIM app.
              </p>
            </div>
          </div>
          <div>
            <div className="pt-4">
              <div>
                <Image
                  alt="A woman using a phone."
                  loading="lazy"
                  width={220}
                  height={180}
                  style={{ color: "transparent" }}
                  src="https://sb.nordcdn.com/m/54d749c3dc7690f8/original/blog-banner-woman-phone.png"
                />
              </div>
            </div>
          </div>
          <div>
            <div className="pt-4 [&>*]:w-full">
              <Link
                role="button"
                className="max-md:w-full text-center inline-block text-primary-on-color bg-dark pointer-fine:hover:bg-neutral-800 border-md border-reversed pointer-fine:hover:border-neutral-800 active:bg-dark! active:text-primary-on-color! box-border touch-manipulation align-bottom rounded-full transition-colors ease-out focus-visible:outline-hidden focus-visible:shadow-focus py-[11px] body-md-medium px-7"
                href={`/${lang}/all-destinations/`}
              >
                Get Saily
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
