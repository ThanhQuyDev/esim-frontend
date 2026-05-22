import Image from "next/image";
import { SOCIAL_LINKS } from "./blog-detail-helpers";

export function SocialIconsRow({ className }: { className?: string }) {
  return (
    <div className={`h-full w-full flex group/stack [&>div:empty]:hidden flex-row items-center gap-x-3 ${className || ""}`}>
      {SOCIAL_LINKS.map((s) => (
        <div key={s.alt}>
          <a
            className="align-bottom transition-colors ease-out focus-visible:outline-hidden focus-visible:shadow-focus"
             
            target="_blank"
            href={s.href}
          >
            <div>
              <Image alt={s.alt} loading="lazy" width={s.w} height={s.h} style={{ color: "transparent" }} src={s.src} />
            </div>
          </a>
        </div>
      ))}
    </div>
  );
}

export function SocialIconsCol({ className }: { className?: string }) {
  return (
    <div className={`h-full group/stack [&>div:empty]:hidden flex-col text-center items-center gap-y-3 hidden sm:flex w-max ${className || ""}`}>
      {SOCIAL_LINKS.map((s) => (
        <div key={s.alt}>
          <a
            className="align-bottom transition-colors ease-out focus-visible:outline-hidden focus-visible:shadow-focus"
             
            target="_blank"
            href={s.href}
          >
            <div>
              <Image alt={s.alt} loading="lazy" width={s.w} height={s.h} style={{ color: "transparent" }} src={s.src} />
            </div>
          </a>
        </div>
      ))}
    </div>
  );
}
