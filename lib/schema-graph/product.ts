/**
 * One JSON-LD @graph for a country or region page (vande-2011 #046), as in
 * Drive row 54 "SCHEMA TRANG SAN PHAM": Organization, ItemPage, Product with
 * an Offer per plan on the page, BreadcrumbList and the page's FAQPage — plus,
 * on a region page, the covered countries (Place) and the coverage options
 * (ItemList). Built from the same plans and FAQs the page shows; no rating,
 * no review, nothing a supplier could be read from.
 */

export const ORIGIN = "https://esim.vn";
export const ORG_ID = `${ORIGIN}/#organization`;
export const LOGO_ID = `${ORIGIN}/#logo`;
const BRAND_ID = `${ORIGIN}/#brand`;

type Lang = "vi" | "en";
type Json = Record<string, unknown>;

export type GraphPlan = {
  id: number | string;
  type?: string | null;
  dataMb?: number | string | null;
  durationDays: number;
  vndPrice?: number | string | null;
  usdPrice?: number | string | null;
  fupSpeed?: string | null;
  operatorName?: string | null;
};

export type GraphFaq = { question: string; answer: string };

/** The site's own Organization, repeated on every page (Google resolves no @id across pages). */
export function orgNode(lang: Lang, full = false): Json {
  return {
    "@type": "Organization",
    "@id": ORG_ID,
    name: "esim.vn",
    legalName: "Công Ty TNHH Viễn Thông ESIM",
    url: `${ORIGIN}/`,
    logo: {
      "@type": "ImageObject",
      "@id": LOGO_ID,
      url: `${ORIGIN}/logo.svg`,
      contentUrl: `${ORIGIN}/logo.svg`,
      caption: "esim.vn",
    },
    image: { "@id": LOGO_ID },
    description:
      lang === "vi"
        ? full
          ? "esim.vn (Công Ty TNHH Viễn Thông ESIM) là nhà cung cấp eSIM du lịch quốc tế tại Việt Nam, thành lập năm 2023, phục vụ du khách với các gói dữ liệu phủ sóng hơn 200 quốc gia và khu vực."
          : "esim.vn (Công Ty TNHH Viễn Thông ESIM) là nhà cung cấp eSIM du lịch quốc tế tại Việt Nam, thành lập năm 2023."
        : full
          ? "esim.vn (Công Ty TNHH Viễn Thông ESIM) is a Vietnam-based international travel eSIM provider, founded in 2023, serving travellers with data plans covering more than 200 countries and regions."
          : "esim.vn (Công Ty TNHH Viễn Thông ESIM) is a Vietnam-based international travel eSIM provider, founded in 2023.",
    foundingDate: "2023",
    telephone: "+84976898989",
    ...(full
      ? {
          address: {
            "@type": "PostalAddress",
            streetAddress: "331/21 Vườn Lài",
            addressLocality: "Phường Phú Thọ Hoà",
            addressRegion: "Thành phố Hồ Chí Minh",
            postalCode: "72012",
            addressCountry: "VN",
          },
        }
      : {}),
    contactPoint: full
      ? [
          {
            "@type": "ContactPoint",
            contactType: "customer service",
            telephone: "+84976898989",
            areaServed: "VN",
            availableLanguage: ["vi", "en"],
          },
        ]
      : {
          "@type": "ContactPoint",
          contactType: "customer service",
          telephone: "+84976898989",
          areaServed: "VN",
          availableLanguage: ["vi", "en"],
        },
    sameAs: ["https://www.facebook.com/eSIMvn.Official", "https://www.youtube.com/@esimvn"],
  };
}

// ── plans ───────────────────────────────────────────────────────────

export type PlanKind = "fixed" | "daily" | "throttled" | "unlimited";

export function kindOf(plan: Pick<GraphPlan, "type">): PlanKind {
  const t = String(plan.type ?? "").toLowerCase();
  if (t.includes("reduce")) return "throttled";
  if (t.includes("unlimit")) return "unlimited";
  if (t.includes("daily") || t.includes("day")) return "daily";
  return "fixed";
}

export function speedLabel(v: string | null | undefined): string {
  return String(v ?? "")
    .replace(/\s*(kbps|mbps)/i, (_m, u: string) => ` ${u.toLowerCase() === "mbps" ? "Mbps" : "Kbps"}`)
    .trim();
}

export function dataLabel(mb: number | string | null | undefined, lang: Lang): string {
  const n = Number(mb);
  if (!n || n <= 0) return lang === "vi" ? "Không giới hạn" : "Unlimited";
  if (n >= 1024) return `${Math.round((n / 1024) * 100) / 100}GB`;
  return `${n}MB`;
}

const dayWord = (n: number, lang: Lang) => (lang === "vi" ? "ngày" : n === 1 ? "day" : "days");
const fmtVnd = (n: number) => `${String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ".")}đ`;
const fmtUsd = (n: number) => `$${Number(n).toFixed(2)}`;
export const fmtPrice = (n: number, lang: Lang) => (lang === "vi" ? fmtVnd(n) : fmtUsd(n));

export function planName(p: GraphPlan, lang: Lang): string {
  const vi = lang === "vi";
  const k = kindOf(p);
  const d = dataLabel(p.dataMb, lang);
  const n = Number(p.durationDays);
  const w = dayWord(n, lang);
  const sp = speedLabel(p.fupSpeed);
  if (k === "unlimited") return vi ? `Không giới hạn${sp ? ` ${sp}` : ""} / ${n} ${w}` : `Unlimited${sp ? ` ${sp}` : ""} / ${n} ${w}`;
  if (k === "throttled") return vi ? `${d}/ngày, sau đó giảm còn ${sp} × ${n} ${w}` : `${d}/day, then ${sp} × ${n} ${w}`;
  if (k === "daily") return vi ? `${d}/ngày × ${n} ${w}` : `${d}/day × ${n} ${w}`;
  return vi ? `${d} tổng / ${n} ${w}` : `${d} total / ${n} ${w}`;
}

const KIND_LABEL: Record<Lang, Record<PlanKind, string>> = {
  vi: {
    fixed: "Gói cố định",
    daily: "Gói theo ngày",
    throttled: "Gói không giới hạn (giảm tốc sau hạn mức mỗi ngày)",
    unlimited: "Gói không giới hạn (tốc độ cố định)",
  },
  en: {
    fixed: "Fixed plan",
    daily: "Daily plan",
    throttled: "Unlimited (speed reduced after the daily quota)",
    unlimited: "Unlimited (fixed speed)",
  },
};

function dataValue(p: GraphPlan, lang: Lang): string {
  const k = kindOf(p);
  const d = dataLabel(p.dataMb, lang);
  if (k === "unlimited") return lang === "vi" ? "Không giới hạn" : "Unlimited";
  if (k === "daily" || k === "throttled") return lang === "vi" ? `${d}/ngày` : `${d}/day`;
  return d;
}

/** Listed price of a plan in the page's currency (not the voucher price). */
export function planPrice(p: GraphPlan, lang: Lang): number {
  return Number(lang === "vi" ? p.vndPrice : p.usdPrice) || 0;
}

/**
 * Our own SKU: what the plan is, and our id. The design's samples used the
 * supplier's plan slug, whose suffix names the supplier (vande-2011 #041).
 */
export function planSku(p: GraphPlan, code: string): string {
  const size = Number(p.dataMb) > 0 ? dataLabel(p.dataMb, "en").toLowerCase() : "unlimited";
  return `${code.toLowerCase()}-${size}-${p.durationDays}days-${kindOf(p)}-${p.id}`;
}

export function planOffer(p: GraphPlan, opts: { url: string; lang: Lang; code: string }): Json {
  const vi = opts.lang === "vi";
  const k = kindOf(p);
  const sku = planSku(p, opts.code);
  const props: Json[] = [
    { "@type": "PropertyValue", name: vi ? "Dung lượng" : "Data", value: dataValue(p, opts.lang) },
    { "@type": "PropertyValue", name: vi ? "Số ngày" : "Days", value: Number(p.durationDays), unitCode: "DAY" },
    { "@type": "PropertyValue", name: vi ? "Loại gói" : "Plan type", value: KIND_LABEL[opts.lang][k] },
  ];
  if ((k === "throttled" || k === "unlimited") && p.fupSpeed) {
    props.push({
      "@type": "PropertyValue",
      name: vi ? (k === "throttled" ? "Tốc độ sau hạn mức" : "Tốc độ") : k === "throttled" ? "Speed after quota" : "Speed",
      value: speedLabel(p.fupSpeed),
    });
  }
  if (p.operatorName) props.push({ "@type": "PropertyValue", name: vi ? "Nhà mạng" : "Carrier", value: p.operatorName });
  return {
    "@type": "Offer",
    "@id": `${opts.url}#plan-${sku}`,
    sku,
    name: planName(p, opts.lang),
    price: planPrice(p, opts.lang),
    priceCurrency: vi ? "VND" : "USD",
    availability: "https://schema.org/InStock",
    itemCondition: "https://schema.org/NewCondition",
    url: opts.url,
    additionalProperty: props,
  };
}

// ── images ──────────────────────────────────────────────────────────

const IMG_OK = /^https:\/\/(esim\.vn|res\.cloudinary\.com\/deqfcfcwf)\//;
const IMG_BAD = /destination-default|airalo|vercel\.app|localhost/i;
export const usableImage = (u: unknown): u is string =>
  typeof u === "string" && IMG_OK.test(u) && !IMG_BAD.test(u);

/** Cloudinary crops of the destination's photo, as in the samples (1:1, 4:3, 16:9). */
export function productImages(image: string | null | undefined, ogImage: string): string[] {
  if (!usableImage(image)) return [ogImage];
  const m = image.match(/^(https:\/\/res\.cloudinary\.com\/deqfcfcwf\/image\/upload\/)(?:[^/]*\/)?(v\d+\/.+?)(?:\.\w+)?$/);
  if (!m) return [image];
  const crop = (w: number, h: number) => `${m[1]}f_webp,q_auto:good,c_fill,w_${w},h_${h},g_center/${m[2]}.webp`;
  return [crop(1200, 1200), crop(1200, 900), crop(1280, 720)];
}

function primaryImage(images: string[], ogImage: string): Json {
  const url = images[0];
  if (url === ogImage) return { "@type": "ImageObject", url, width: 1200, height: 630 };
  const m = url.match(/[,/]w_(\d+),h_(\d+)/);
  return { "@type": "ImageObject", url, ...(m ? { width: Number(m[1]), height: Number(m[2]) } : {}) };
}

// ── FAQ ─────────────────────────────────────────────────────────────

/** Tags Google accepts in an answer; anything else is dropped, attributes too. */
export function cleanAnswer(html: string): string {
  return html
    .replace(/<(\/?)(a|b|strong|br|p|ul|ol|li)\b[^>]*>/gi, (m, slash: string, tag: string) => {
      if (tag.toLowerCase() === "a" && !slash) {
        const href = m.match(/href\s*=\s*"([^"]*)"/i)?.[1];
        return href ? `<a href="${href}">` : "<a>";
      }
      return `<${slash}${tag.toLowerCase()}>`;
    })
    .replace(/<(?!\/?(a|b|strong|br|p|ul|ol|li)\b)[^>]*>/gi, "")
    .trim();
}

export function faqNode(faqs: GraphFaq[], lang: Lang, url: string): Json | null {
  const seen = new Set<string>();
  const items = faqs
    .map((f) => ({ q: f.question.trim(), a: cleanAnswer(f.answer) }))
    .filter((f) => f.q && f.a && !seen.has(f.q) && seen.add(f.q));
  if (!items.length) return null;
  return {
    "@type": "FAQPage",
    "@id": `${url}#faq`,
    url,
    inLanguage: lang,
    isPartOf: { "@id": `${url}#webpage` },
    mainEntity: items.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

export function breadcrumbNode(url: string, trail: { name: string; item: string }[]): Json {
  return {
    "@type": "BreadcrumbList",
    "@id": `${url}#breadcrumb`,
    itemListElement: trail.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.name, item: c.item })),
  };
}

// ── the product page ────────────────────────────────────────────────

export type CoveredPlace = { name: string; countryCode?: string | null };
export type CoverageScope = { name: string; countries: number; from: number };

/** Territories filed as a Place rather than a Country (as in the Europe sample). */
const TERRITORIES = new Set(
  "AX AI AS AW BL BM BQ CK CW FK FO GF GG GI GL GP GU HK IM JE KY MF MO MP MQ MS NC NU PF PM PR RE SX TC TK VG VI WF YT".split(" ")
);

export type ProductGraphInput = {
  lang: Lang;
  /** Absolute canonical URL of the page. */
  url: string;
  /** "eSIM Trung Quốc" / "China eSIM". */
  productName: string;
  /** Breadcrumb's last label. */
  breadcrumbLabel: string;
  /** The page's own introduction (its visible description). */
  intro: string;
  /** SEO title and meta description of the page. */
  title: string;
  metaDescription: string;
  /** The destination's own picture, if any. */
  image?: string | null;
  ogImage: string;
  /** Country code for SKUs ("cn", or the region slug's short form). */
  code: string;
  /** Plans the page offers (the default coverage on a region page). */
  plans: GraphPlan[];
  faqs: GraphFaq[];
  /** Trang chủ → Điểm đến → this page. */
  trail: { name: string; item: string }[];
  /** Region pages only. */
  region?: {
    name: string;
    places: CoveredPlace[];
    scopes: CoverageScope[];
  } | null;
};

export function buildProductGraph(input: ProductGraphInput): Json | null {
  const { lang, url } = input;
  const vi = lang === "vi";
  const plans = input.plans.filter((p) => planPrice(p, lang) > 0);
  if (!plans.length) return null;

  const home = vi ? `${ORIGIN}/` : `${ORIGIN}/en`;
  const ids = {
    page: `${url}#webpage`,
    product: `${url}#product`,
    bc: `${url}#breadcrumb`,
    faq: `${url}#faq`,
    place: `${url}#coverage`,
    scopes: `${url}#coverage-options`,
  };

  const offers = plans
    .map((p) => planOffer(p, { url, lang, code: input.code }))
    .sort((a, b) => (a.price as number) - (b.price as number) || String(a.sku).localeCompare(String(b.sku)));
  const prices = offers.map((o) => o.price as number);
  const low = Math.min(...prices);
  const high = Math.max(...prices);
  const days = plans.map((p) => Number(p.durationDays));
  const dayRange = `${Math.min(...days)} – ${Math.max(...days)} ${vi ? "ngày" : "days"}`;
  const byKind = (k: PlanKind) => plans.filter((p) => kindOf(p) === k);
  const range = (arr: GraphPlan[]) =>
    `${dataLabel(Math.min(...arr.map((p) => Number(p.dataMb))), lang)} – ${dataLabel(Math.max(...arr.map((p) => Number(p.dataMb))), lang)}`;
  const fx = byKind("fixed");
  const dl = byKind("daily");
  const unl = [...byKind("throttled"), ...byKind("unlimited")];
  const parts: string[] = [];
  if (fx.length) parts.push(vi ? `${fx.length} gói cố định ${range(fx)}` : `${fx.length} fixed plans of ${range(fx)}`);
  if (dl.length)
    parts.push(
      vi
        ? `${dl.length} gói theo ngày ${range(dl).replace(" – ", "/ngày – ")}/ngày`
        : `${dl.length} daily plans of ${range(dl).replace(" – ", "/day – ")}/day`
    );
  if (unl.length) parts.push(vi ? `${unl.length} gói không giới hạn dung lượng` : `${unl.length} unlimited-data plans`);
  const planTypes = [
    fx.length && (vi ? "gói cố định" : "fixed plans"),
    dl.length && (vi ? "gói theo ngày" : "daily plans"),
    unl.length && (vi ? "gói không giới hạn dung lượng" : "unlimited-data plans"),
  ]
    .filter(Boolean)
    .join(", ");
  const intro = input.intro.trim().replace(/([^.!?…])$/, "$1.");

  const region = input.region;
  let description: string;
  let extraProps: [string, string][] = [];
  if (region) {
    const counts = region.scopes.map((s) => s.countries);
    const scopeLow = region.scopes.length ? Math.min(...region.scopes.map((s) => s.from)) : low;
    const nPlaces = region.places.length;
    description = vi
      ? `${intro}${region.scopes.length > 1 ? ` Có ${region.scopes.length} phạm vi phủ sóng từ ${Math.min(...counts)} đến ${Math.max(...counts)} nước, giá từ ${fmtPrice(scopeLow, lang)}.` : ""} Phạm vi "${region.name}" gồm ${offers.length} gói ${range(plans.filter((p) => Number(p.dataMb) > 0).length ? plans.filter((p) => Number(p.dataMb) > 0) : plans)}, thời hạn ${dayRange}, giá từ ${fmtPrice(low, lang)}.`
      : `${intro}${region.scopes.length > 1 ? ` ${region.scopes.length} coverage options from ${Math.min(...counts)} to ${Math.max(...counts)} countries, from ${fmtPrice(scopeLow, lang)}.` : ""} The "${region.name}" coverage has ${offers.length} plans, ${dayRange}, from ${fmtPrice(low, lang)}.`;
    extraProps = [
      [
        vi ? "Phạm vi phủ sóng" : "Coverage",
        vi
          ? `${nPlaces} quốc gia và vùng lãnh thổ (phạm vi "${region.name}")${region.scopes.length > 1 ? `; ${region.scopes.length} phạm vi để chọn, từ ${Math.min(...counts)} đến ${Math.max(...counts)} nước` : ""}`
          : `${nPlaces} countries and territories ("${region.name}" coverage)${region.scopes.length > 1 ? `; ${region.scopes.length} options from ${Math.min(...counts)} to ${Math.max(...counts)} countries` : ""}`,
      ],
    ];
  } else {
    description = vi
      ? `${intro} Hiện có ${offers.length} gói ${input.productName} (${parts.join(", ")}), thời hạn ${dayRange}, giá từ ${fmtPrice(low, lang)}.`
      : `${intro} There are ${offers.length} ${input.productName} plans right now (${parts.join(", ")}), ${dayRange}, from ${fmtPrice(low, lang)}.`;
  }

  const images = productImages(input.image, input.ogImage);
  const faq = faqNode(input.faqs, lang, url);

  const product: Json = {
    "@type": "Product",
    "@id": ids.product,
    name: input.productName,
    url,
    image: images,
    description,
    category: vi ? "eSIM du lịch quốc tế" : "International travel eSIM",
    brand: { "@type": "Brand", "@id": BRAND_ID, name: "esim.vn", url: `${ORIGIN}/`, logo: { "@id": LOGO_ID } },
    additionalProperty: (
      (vi
        ? [
            ["Loại SIM", "eSIM data (không hỗ trợ nghe gọi, SMS)"],
            ...extraProps,
            ["Các loại gói", planTypes],
            ["Thời hạn sử dụng", dayRange],
            ["Nhận eSIM", "Ngay lập tức qua email (link cài đặt nhanh hoặc mã QR)"],
            ["Thời điểm bắt đầu tính gói", "Khi đến nơi và kết nối mạng lần đầu"],
            ["Nạp thêm dữ liệu (Top-up)", "Có"],
            ["Xác thực danh tính", "Không cần"],
          ]
        : [
            ["SIM type", "Data-only eSIM (no calls or SMS)"],
            ...extraProps,
            ["Plan types", planTypes],
            ["Validity", dayRange],
            ["Delivery", "Instantly by email (quick-install link or QR code)"],
            ["Plan starts", "When you arrive and first connect to a network"],
            ["Top-up", "Available"],
            ["Identity verification", "Not required"],
          ]) as [string, string][]
    ).map(([name, value]) => ({ "@type": "PropertyValue", name, value })),
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: vi ? "VND" : "USD",
      lowPrice: String(low),
      highPrice: String(high),
      offerCount: offers.length,
      availability: "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",
      url,
      ...(region ? { areaServed: { "@id": ids.place } } : {}),
      seller: { "@id": ORG_ID },
      offers,
    },
    mainEntityOfPage: { "@id": ids.page },
  };

  const hasPart = [
    ...(region && region.scopes.length > 1 ? [{ "@id": ids.scopes }] : []),
    ...(faq ? [{ "@id": ids.faq }] : []),
  ];

  const graph: Json[] = [
    orgNode(lang),
    {
      "@type": "ItemPage",
      "@id": ids.page,
      url,
      name: input.title,
      description: input.metaDescription,
      inLanguage: lang,
      isPartOf: { "@type": "WebSite", "@id": `${home}#website`, url: home, name: "esim.vn" },
      about: { "@id": ids.product },
      mainEntity: { "@id": ids.product },
      breadcrumb: { "@id": ids.bc },
      primaryImageOfPage: primaryImage(images, input.ogImage),
      ...(hasPart.length ? { hasPart } : {}),
    },
    product,
  ];

  if (region) {
    graph.push({
      "@type": "Place",
      "@id": ids.place,
      name: vi ? `${region.name} (${region.places.length} điểm đến)` : `${region.name} (${region.places.length} destinations)`,
      containsPlace: region.places.map((p) => ({
        "@type": p.countryCode && TERRITORIES.has(p.countryCode.toUpperCase()) ? "Place" : "Country",
        name: p.name,
      })),
    });
    if (region.scopes.length > 1) {
      graph.push({
        "@type": "ItemList",
        "@id": ids.scopes,
        name: vi ? `Phạm vi phủ sóng ${input.productName}` : `${input.productName} coverage options`,
        numberOfItems: region.scopes.length,
        itemListElement: region.scopes.map((s, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: s.name,
          description: vi
            ? `${s.countries} quốc gia · từ ${fmtPrice(s.from, lang)}`
            : `${s.countries} countries · from ${fmtPrice(s.from, lang)}`,
        })),
      });
    }
  }

  graph.push(breadcrumbNode(url, input.trail));
  if (faq) graph.push(faq);
  return { "@context": "https://schema.org", "@graph": graph };
}

/** JSON for a <script> in <head>: `<` escaped so content can never close the tag. */
export function jsonLdText(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
