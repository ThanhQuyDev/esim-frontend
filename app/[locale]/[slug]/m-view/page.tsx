import UnifiedSlugPage from "../page";
import { DeviceVariantProvider } from "@/lib/device-variant-context";

/**
 * Mobile layout of the product page (#001, test round 4). Phones are rewritten
 * here by the middleware so the HTML holds only the mobile layout and one
 * <h1>; see `i18n/device-variant.ts`. Same data, metadata and canonical URL as
 * the desktop page — only the layout differs.
 */
export { generateMetadata, generateStaticParams } from "../page";

export default function MobileSlugPage(props: { params: { slug: string } }) {
  return (
    <DeviceVariantProvider variant="mobile">
      <UnifiedSlugPage {...props} />
    </DeviceVariantProvider>
  );
}
