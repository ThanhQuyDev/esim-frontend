import type { SocialLink } from "./blog-detail-helpers";

export function SocialIconsRow({ links, className }: { links: SocialLink[]; className?: string }) {
  if (!links || links.length === 0) return null;
  return (
    <div className={`h-full w-full flex group/stack [&>div:empty]:hidden flex-row items-center gap-x-3 ${className || ""}`}>
      {links.map((s) => (
        <div key={s.alt + s.href}>
          <a
            className="align-bottom transition-colors ease-out focus-visible:outline-hidden focus-visible:shadow-focus"
            target="_blank"
            rel="noopener noreferrer"
            href={s.href}
          >
            <div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img alt={s.alt} loading="lazy" width={24} height={24} style={{ color: "transparent" }} src={s.src} />
            </div>
          </a>
        </div>
      ))}
    </div>
  );
}

export function SocialIconsCol({ links, className }: { links: SocialLink[]; className?: string }) {
  if (!links || links.length === 0) return null;
  return (
    <div className={`h-full group/stack [&>div:empty]:hidden flex-col text-center items-center gap-y-3 hidden sm:flex w-max ${className || ""}`}>
      {links.map((s) => (
        <div key={s.alt + s.href}>
          <a
            className="align-bottom transition-colors ease-out focus-visible:outline-hidden focus-visible:shadow-focus"
            target="_blank"
            rel="noopener noreferrer"
            href={s.href}
          >
            <div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img alt={s.alt} loading="lazy" width={24} height={24} style={{ color: "transparent" }} src={s.src} />
            </div>
          </a>
        </div>
      ))}
    </div>
  );
}
