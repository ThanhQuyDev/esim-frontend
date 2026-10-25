import DomesticCarrierPage from "../page";
import { DeviceVariantProvider } from "@/lib/device-variant-context";

/**
 * Mobile layout of the domestic eSIM carrier page (vande #030). Phones are
 * rewritten here by the middleware so the HTML holds only the mobile layout
 * and one set of headings; see `i18n/device-variant.ts`. Same data, metadata
 * and canonical URL as the desktop page.
 */
export { generateMetadata } from "../page";
export const dynamic = "force-dynamic";

export default function MobileDomesticCarrierPage(props: {
  params: { carrier: string; locale: string };
}) {
  return (
    <DeviceVariantProvider variant="mobile">
      <DomesticCarrierPage {...props} />
    </DeviceVariantProvider>
  );
}
