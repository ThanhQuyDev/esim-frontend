import Image from "next/image";
import Link from "next/link";
import type { BlogMiniTag } from "@/lib/api";

export function BlogMiniTagWidget({ miniTag }: { miniTag: BlogMiniTag }) {
  return (
    <div className="flex flex-col md:flex-row gap-4 md:gap-6 w-full p-4 md:p-6 rounded-sm bg-gray-100">
      {miniTag.image && (
        <figure className="flex justify-center items-center w-[120px] min-w-[120px] h-[120px] [&_img]:max-w-none rounded-sm overflow-hidden">
          <div>
            <Image
              alt={miniTag.title || "Save on mobile data with the Saily app"}
              loading="lazy"
              width={120}
              height={120}
              style={{ color: "transparent" }}
              src={miniTag.image}
            />
          </div>
        </figure>
      )}
      <div className="flex flex-col gap-3 md:gap-4">
        <div className="flex flex-col gap-2 md:gap-3">
          {miniTag.title && (
            <p className="heading-sm text-primary scroll-mt-20 xl:scroll-mt-24">{miniTag.title}</p>
          )}
          {miniTag.description && (
            <p className="text-secondary scroll-mt-20 xl:scroll-mt-24">{miniTag.description}</p>
          )}
        </div>
        {miniTag.linkUrl && miniTag.contentButton && (
          <div>
            <Link
              role="button"
              className="max-md:w-full text-center inline-block text-primary-on-color bg-dark pointer-fine:hover:bg-neutral-800 border-md border-reversed pointer-fine:hover:border-neutral-800 active:bg-dark! active:text-primary-on-color! box-border touch-manipulation align-bottom rounded-full transition-colors ease-out focus-visible:outline-hidden focus-visible:shadow-focus py-[8.5px] body-sm-medium px-6"
              href={miniTag.linkUrl}
            >
              {miniTag.contentButton}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
