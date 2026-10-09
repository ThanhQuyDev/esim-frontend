import UnifiedSlugPage, { generateStaticParams as slugStaticParams } from "../page";
import { DeviceVariantProvider } from "@/lib/device-variant-context";

/**
 * Prebuild the same pages as the desktop route, except slugs too long to be a
 * directory name (some region packs are named after every country code they
 * cover). Those still render — on first request instead of at build time.
 */
const MAX_PREBUILT_SLUG_LENGTH = 200;

export async function generateStaticParams() {
  const params = await slugStaticParams();
  return params.filter((p) => p.slug.length <= MAX_PREBUILT_SLUG_LENGTH);
}

/**
 * Mobile layout of the product page (#001, test round 4). Phones are rewritten
 * here by the middleware so the HTML holds only the mobile layout and one
 * <h1>; see `i18n/device-variant.ts`. Same data, metadata and canonical URL as
 * the desktop page — only the layout differs.
 */
export { generateMetadata } from "../page";

export default function MobileSlugPage(props: { params: { slug: string } }) {
  return (
    <DeviceVariantProvider variant="mobile">
      <UnifiedSlugPage {...props} />
    </DeviceVariantProvider>
  );
}
