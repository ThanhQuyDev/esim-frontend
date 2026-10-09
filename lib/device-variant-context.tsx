"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

/**
 * Which product-page layout to render (#001, test round 4). The server picks
 * it from the User-Agent (see `i18n/device-variant.ts`) so the HTML holds a
 * single layout and a single <h1>. After hydration the browser re-checks the
 * real viewport, so a narrow desktop window or a tablet still gets the layout
 * that fits — swapping one layout for the other, never showing both.
 */
export type DeviceVariant = "desktop" | "mobile";

/** Same breakpoint the two layouts were split at with CSS (≤840px = mobile). */
const DESKTOP_QUERY = "(min-width: 841px)";

const DeviceVariantContext = createContext<DeviceVariant>("desktop");

export function DeviceVariantProvider({
  variant,
  children,
}: {
  variant: DeviceVariant;
  children: ReactNode;
}) {
  return (
    <DeviceVariantContext.Provider value={variant}>{children}</DeviceVariantContext.Provider>
  );
}

export function useDeviceVariant(): DeviceVariant {
  const serverVariant = useContext(DeviceVariantContext);
  const [variant, setVariant] = useState<DeviceVariant>(serverVariant);

  useEffect(() => {
    const mq = window.matchMedia(DESKTOP_QUERY);
    const sync = () => setVariant(mq.matches ? "desktop" : "mobile");
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return variant;
}
