/**
 * USD → VND rate, shared by the client hook and by server-rendered copy (#050).
 *
 * The client already fetched this in `useExchangeRate`; server components (SEO
 * metadata, schema, the country description) need the same number, so the fetch
 * lives here with Next's own cache in front of it.
 */

export const FALLBACK_USD_VND_RATE = 25_500;

interface ExchangeRateApiResponse {
  conversion_rates?: Record<string, number>;
}

/**
 * Server-side rate lookup. Revalidated hourly, and any failure falls back to the
 * same constant the client uses — a page must never fail to render because a
 * third-party rate API is down.
 */
export async function getUsdVndRate(): Promise<number> {
  try {
    const res = await fetch("https://open.er-api.com/v6/latest/USD", {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return FALLBACK_USD_VND_RATE;
    const data: ExchangeRateApiResponse = await res.json();
    const rate = data.conversion_rates?.VND;
    return typeof rate === "number" && rate > 0 ? rate : FALLBACK_USD_VND_RATE;
  } catch {
    return FALLBACK_USD_VND_RATE;
  }
}
