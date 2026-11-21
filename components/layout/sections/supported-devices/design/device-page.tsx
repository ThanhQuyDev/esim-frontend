"use client";

import "./tbh.css";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { eidValid, getDeviceInfo, norm, verdictFor, type CheckState, type Verdict } from "./device-detect";

/**
 * "Thiết bị hỗ trợ eSIM" as designed in Drive row 32 (vande-2011 #031, v25,
 * spec thiet-bi-ho-tro-esim-dac-ta-tinh-nang.md): the design's markup and
 * CSS (scoped under .tbh), the device list and notes from the CMS, the
 * visitor's own device checked on the spot, a computer handing the check to
 * a phone by QR code, and the EID check.
 */

type Brand = { manufacturer: string; devices: { id: string; device: string }[]; notes?: string[] };
export type DeviceGroup = { type: string; manufacturers: Brand[]; notes?: string[] };
export type PageFaq = { question: string; answer: string };

const TABS = [
  { key: "p", type: "Smart Phones", icon: "i-phone" },
  { key: "w", type: "Smart Watches", icon: "i-watch" },
  { key: "t", type: "Tablets", icon: "i-tablet" },
  { key: "l", type: "Laptops", icon: "i-laptop" },
] as const;
type TabKey = (typeof TABS)[number]["key"];

const T = {
  vi: {
    home: "Trang chủ",
    crumb: "Thiết bị hỗ trợ",
    h1: "Thiết bị hỗ trợ eSIM",
    sub: "Chỉ những thiết bị đã mở khóa nhà mạng và hỗ trợ công nghệ eSIM mới có thể sử dụng esim.vn.",
    search: "Tìm kiếm thiết bị",
    clear: "Xóa nội dung tìm kiếm",
    results: "Kết quả tìm kiếm",
    none: (q: string) => `Không tìm thấy “${q}” trong danh sách. Thiết bị có thể chưa được hỗ trợ — hãy kiểm tra bằng mã EID bên dưới.`,
    tabs: { p: "Điện thoại", w: "Đồng hồ thông minh", t: "Máy tính bảng", l: "Máy tính xách tay" },
    leads: {
      p: "esim.vn có sẵn trên hầu hết iPhone và nhiều điện thoại Android:",
      w: "eSIM trên đồng hồ thường gắn với nhà mạng. Các đời đồng hồ có bản Cellular/LTE dưới đây có chip eSIM:",
      t: "Chỉ các bản có kết nối di động (Cellular/LTE/5G) mới dùng được eSIM:",
      l: "Chỉ các mẫu có sẵn modem di động và chip eSIM mới dùng được eSIM:",
    },
    tabList: "Loại thiết bị",
    labelPc: "Bạn đang dùng máy tính",
    labelSelf: "Có vẻ thiết bị của bạn là",
    labelPicked: "Bạn đã chọn",
    labelScanned: "Điện thoại bạn vừa quét",
    pcName: "Kiểm tra bằng điện thoại của bạn",
    badge: { ok: "Được hỗ trợ", no: "Không hỗ trợ", unk: "Chưa chắc chắn" },
    note: {
      ok: "Thiết bị này dùng được eSIM. Máy cần được mua chính hãng hoặc đã mở khóa mạng.",
      no: "Thiết bị này chưa nằm trong danh sách hỗ trợ eSIM. Nếu bạn không chắc, hãy kiểm tra bằng mã EID bên dưới.",
      unk: "Chưa xác định được đời máy. Hãy tìm tên thiết bị ở ô tìm kiếm phía trên, hoặc bấm *#06# để kiểm tra chắc chắn bằng mã EID.",
      pc: "Máy tính không cho biết điện thoại bạn định dùng eSIM. Hãy quét mã QR bên dưới bằng chính chiếc điện thoại đó, hoặc tìm tên thiết bị ở ô tìm kiếm phía trên.",
    },
    model: (m: string) => `Mã model ${m}`,
    region: "Xem lưu ý vùng bán",
    regionText:
      "Trình duyệt không cho biết chính xác đời máy. Lưu ý: iPhone mua tại Trung Quốc đại lục, Hồng Kông hoặc Ma Cao thường không có eSIM. Nếu máy mua ở các nơi này, hãy kiểm tra bằng *#06# hoặc mã EID bên dưới.",
    go: "Chọn eSIM cho chuyến đi",
    pick: "Chọn đời máy của bạn",
    other: "Kiểm tra điện thoại khác",
    sent: "Kết quả đã được gửi về máy tính của bạn.",
    expired: "Mã đã hết hạn, hãy tải lại mã QR trên máy tính.",
    qrLabel: "Mã QR kiểm tra thiết bị",
    steps: [
      "Mở camera trên điện thoại bạn định dùng eSIM.",
      "Quét mã QR này, trang kiểm tra sẽ tự mở trên điện thoại.",
      "Kết quả hiện trên điện thoại và tự cập nhật tại đây.",
    ],
    waiting: "Đang chờ bạn quét…",
    qrNote: "Mã chỉ dùng để kiểm tra thiết bị, không chứa thông tin cá nhân.",
    eid: "Kiểm tra chắc chắn bằng mã EID",
    eidHelp: ["Bấm ", "*#06#", " trên bàn phím gọi để xem số EID (32 chữ số). Trên iPhone còn xem được ở Cài đặt › Cài đặt chung › Giới thiệu. Máy có EID là máy có chip eSIM."],
    eidPlaceholder: "Nhập 32 chữ số EID",
    eidLabel: "Mã EID",
    eidCheck: "Kiểm tra",
    eidCount: (n: number) => `Đã nhập ${n}/32 chữ số.`,
    eidEmpty: "Hãy nhập số EID.",
    eidShort: (n: number) => `EID gồm đủ 32 chữ số, bạn mới nhập ${n} chữ số.`,
    eidOk: "✓ EID hợp lệ: máy của bạn có chip eSIM.",
    eidBad: "EID không hợp lệ. Hãy kiểm tra lại từng chữ số, hoặc máy có thể không có eSIM.",
    phone: "Điện thoại Android",
    faq: "Câu hỏi thường gặp",
    destinations: "/diem-den",
  },
  en: {
    home: "Home",
    crumb: "Supported devices",
    h1: "eSIM supported devices",
    sub: "Only carrier-unlocked devices that support eSIM technology can use esim.vn.",
    search: "Search for a device",
    clear: "Clear search",
    results: "Search results",
    none: (q: string) => `“${q}” is not on the list. The device may not be supported — check with its EID below.`,
    tabs: { p: "Phones", w: "Smartwatches", t: "Tablets", l: "Laptops" },
    leads: {
      p: "esim.vn works on most iPhones and many Android phones:",
      w: "eSIM on a watch is usually tied to a carrier. The Cellular/LTE versions of these watches have an eSIM chip:",
      t: "Only the versions with a mobile connection (Cellular/LTE/5G) can use an eSIM:",
      l: "Only models with a built-in mobile modem and an eSIM chip can use an eSIM:",
    },
    tabList: "Device type",
    labelPc: "You are on a computer",
    labelSelf: "Your device looks like",
    labelPicked: "You chose",
    labelScanned: "The phone you just scanned",
    pcName: "Check with your phone",
    badge: { ok: "Supported", no: "Not supported", unk: "Not sure" },
    note: {
      ok: "This device can use an eSIM. It must be bought from the maker or carrier-unlocked.",
      no: "This device is not on the eSIM list. If you are not sure, check with its EID below.",
      unk: "We could not tell the exact model. Search for your device above, or dial *#06# to check with its EID.",
      pc: "A computer cannot tell which phone you will use the eSIM on. Scan the QR code below with that phone, or search for it above.",
    },
    model: (m: string) => `Model ${m}`,
    region: "See where it was bought",
    regionText:
      "Browsers do not tell the exact model. Note: iPhones bought in mainland China, Hong Kong or Macao usually have no eSIM. If yours was bought there, check with *#06# or its EID below.",
    go: "Choose an eSIM for your trip",
    pick: "Choose your model",
    other: "Check another phone",
    sent: "The result was sent to your computer.",
    expired: "This code has expired. Reload the QR code on your computer.",
    qrLabel: "Device check QR code",
    steps: [
      "Open the camera on the phone you will use the eSIM on.",
      "Scan this QR code; the check opens on the phone.",
      "The result shows on the phone and updates here.",
    ],
    waiting: "Waiting for your scan…",
    qrNote: "The code only checks the device; it holds no personal information.",
    eid: "Check for sure with the EID",
    eidHelp: ["Dial ", "*#06#", " to see the EID (32 digits). On an iPhone it is also under Settings › General › About. A device with an EID has an eSIM chip."],
    eidPlaceholder: "Enter the 32-digit EID",
    eidLabel: "EID",
    eidCheck: "Check",
    eidCount: (n: number) => `${n}/32 digits entered.`,
    eidEmpty: "Enter the EID.",
    eidShort: (n: number) => `An EID has 32 digits; you entered ${n}.`,
    eidOk: "✓ Valid EID: your device has an eSIM chip.",
    eidBad: "Invalid EID. Check each digit, or the device may have no eSIM.",
    phone: "Android phone",
    faq: "Frequently asked questions",
    destinations: "/en/destinations",
  },
};

const Ic = ({ id, w = 16 }: { id: string; w?: number }) => (
  <svg className="ic" width={w} height={w} aria-hidden="true">
    <use href={`#${id}`} />
  </svg>
);

const SPRITE = (
  <svg width={0} height={0} style={{ position: "absolute" }} aria-hidden="true">
    <symbol id="ic-sc" viewBox="0 0 16 16"><path fill="currentColor" fillRule="evenodd" d="M13.2151 6.8326L8.43758 11.4101C8.27758 11.5451 8.12758 11.6001 8.00008 11.6001C7.87258 11.6001 7.70083 11.5446 7.58533 11.4329L2.78533 6.8326C2.54543 6.6051 2.53763 6.2026 2.76733 5.9851C2.99546 5.74447 3.37683 5.73665 3.61508 5.96713L8.00008 10.1701L12.3851 5.9701C12.6226 5.73962 13.0046 5.74745 13.2328 5.98807C13.4626 6.2026 13.4551 6.6051 13.2151 6.8326Z" /></symbol>
    <symbol id="i-s" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></g></symbol>
    <symbol id="i-d" viewBox="0 0 24 24"><path d="m6 9 6 6 6-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></symbol>
    <symbol id="i-ch" viewBox="0 0 24 24"><path d="m9 18 6-6-6-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></symbol>
    <symbol id="i-laptop" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="5" width="16" height="11" rx="2" /><path d="M2 20h20" /></g></symbol>
    <symbol id="i-info" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9.5" /><path d="M12 11v5.5M12 7.5v.1" /></g></symbol>
    <symbol id="i-cx" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></symbol>
    <symbol id="i-ok" viewBox="0 0 24 24"><path d="m5 12.5 4.5 4.5L19 7.5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></symbol>
    <symbol id="i-phone" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="6.5" y="2.5" width="11" height="19" rx="2.5" /><path d="M11 18.5h2" /></g></symbol>
    <symbol id="i-watch" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="7" y="7" width="10" height="10" rx="2.5" /><path d="M9 7l.7-4h4.6L15 7M9 17l.7 4h4.6L15 17" /></g></symbol>
    <symbol id="i-tablet" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="3" width="16" height="18" rx="2.5" /><path d="M11 18h2" /></g></symbol>
  </svg>
);

type Source = "" | "qr" | "ph";

export function DevicePage({
  groups,
  faqs,
  lang,
  apiBase,
}: {
  groups: DeviceGroup[];
  faqs: PageFaq[];
  lang: "vi" | "en";
  apiBase: string;
}) {
  const t = T[lang];
  const byTab = useMemo(() => {
    const m = new Map<TabKey, DeviceGroup>();
    for (const tab of TABS) {
      const g = groups.find((x) => x.type === tab.type);
      if (g) m.set(tab.key, g);
    }
    return m;
  }, [groups]);
  const allDevices = useMemo(
    () =>
      TABS.flatMap((tab) =>
        (byTab.get(tab.key)?.manufacturers ?? []).flatMap((b) =>
          b.devices.map((d) => ({ tab: tab.key, brand: b.manufacturer, name: d.device, key: norm(`${b.manufacturer} ${d.device}`) }))
        )
      ),
    [byTab]
  );

  // ── result card ──
  const [state, setState] = useState<CheckState>("pc");
  const [src, setSrc] = useState<Source>("");
  const [label, setLabel] = useState(t.labelPc);
  const [devName, setDevName] = useState(t.pcName);
  const [model, setModel] = useState<string | null>(null);
  const [region, setRegion] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [iconKey, setIconKey] = useState(0);
  const show = useCallback((v: Verdict, lbl: string, source: Source) => {
    setState(v.state);
    setDevName(v.name);
    setModel(v.model ?? null);
    setLabel(lbl);
    setSrc(source);
    setRegion(false);
    setIconKey((k) => k + 1);
  }, []);

  // A new QR code for a computer, refreshed when it expires.
  const newSession = useCallback(async () => {
    try {
      const res = await fetch(`${apiBase}/api/v1/device-check/sessions`, { method: "POST" });
      if (!res.ok) return;
      const body = (await res.json()) as { token: string };
      setToken(body.token);
    } catch {
      /* stays without a code; search and EID still work */
    }
  }, [apiBase]);

  // Once per page view, even when React runs effects twice (dev): a token is
  // single-use and a second session would leave the QR and the poll apart.
  const started = useRef(false);
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    (async () => {
      const url = new URL(window.location.href);
      const k = url.searchParams.get("k");
      if (k) {
        url.searchParams.delete("k");
        window.history.replaceState(null, "", url.pathname + url.search + url.hash);
      }
      const info = await getDeviceInfo();
      const v = verdictFor(info, allDevices.map((d) => `${d.brand} ${d.name}`), t.phone);
      if (v.state === "pc") {
        show({ state: "pc", name: t.pcName }, t.labelPc, "");
        newSession();
        return;
      }
      show(v, t.labelSelf, k ? "qr" : "");
      if (k) {
        const res = await fetch(`${apiBase}/api/v1/device-check/sessions/${encodeURIComponent(k)}/result`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ state: v.state, name: v.name, model: v.model ?? null }),
        }).catch(() => null);
        if (!res?.ok) {
          setSrc("");
          setNotice(t.expired);
        }
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // The computer waits for the phone's answer.
  useEffect(() => {
    if (state !== "pc" || !token) return;
    let stop = false;
    const poll = async () => {
      if (stop) return;
      try {
        const res = await fetch(`${apiBase}/api/v1/device-check/sessions/${encodeURIComponent(token)}`, { cache: "no-store" });
        const body = (await res.json()) as { status: string; result?: Verdict };
        if (stop) return;
        if (body.status === "done" && body.result) {
          show(body.result, t.labelScanned, "ph");
          setToken(null);
          return;
        }
        if (body.status === "expired") {
          newSession();
          return;
        }
      } catch {
        /* try again */
      }
      timer = window.setTimeout(poll, 2500);
    };
    let timer = window.setTimeout(poll, 2500);
    return () => {
      stop = true;
      window.clearTimeout(timer);
    };
  }, [state, token, apiBase, newSession, show, t.labelScanned]);

  const qrUrl =
    token && typeof window !== "undefined"
      ? `${window.location.origin}${window.location.pathname}?k=${encodeURIComponent(token)}`
      : "";

  // ── search ──
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [stickyTab, setStickyTab] = useState<TabKey | null>(null);
  const words = norm(q).split(" ").filter(Boolean);
  const matches = useMemo(() => {
    if (norm(q).length < 2) return [];
    return allDevices.filter((d) => words.every((w) => d.key.includes(w)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, allDevices]);
  const grouped = TABS.map((tab) => ({ tab, items: matches.filter((m) => m.tab === tab.key) })).filter((g) => g.items.length);
  const flat = grouped.flatMap((g) => g.items);
  useEffect(() => setActive(-1), [q]);
  useEffect(() => setStickyTab(grouped[0]?.tab.key ?? null), [q]); // eslint-disable-line react-hooks/exhaustive-deps

  const choose = (i: number) => {
    const d = flat[i];
    if (!d) return;
    setQ(d.name);
    setOpen(false);
    show({ state: "ok", name: d.name }, t.labelPicked, src === "ph" ? "" : src);
  };
  const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      if (!flat.length) return;
      e.preventDefault();
      setOpen(true);
      setActive((a) => (e.key === "ArrowDown" ? (a + 1) % flat.length : (a - 1 + flat.length) % flat.length));
    } else if (e.key === "Enter") {
      if (active >= 0) {
        e.preventDefault();
        choose(active);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };
  useEffect(() => {
    if (active < 0) return;
    document.getElementById(`ro-${active}`)?.scrollIntoView({ block: "nearest" });
  }, [active]);
  const onListScroll = () => {
    const list = listRef.current;
    if (!list) return;
    let current: TabKey | null = grouped[0]?.tab.key ?? null;
    for (const g of grouped) {
      const el = list.querySelector<HTMLElement>(`[data-g="${g.tab.key}"]`);
      if (el && el.offsetTop - list.scrollTop <= 4) current = g.tab.key;
    }
    setStickyTab(current);
  };
  const pickModel = () => {
    const pre = devName.startsWith("iPhone") ? "iPhone " : devName.startsWith("iPad") ? "iPad " : "";
    setQ(pre);
    setOpen(!!pre);
    const input = inputRef.current;
    input?.scrollIntoView({ block: "center", behavior: "smooth" });
    input?.focus();
  };

  // ── EID ──
  const [eidOpen, setEidOpen] = useState(false);
  const [eid, setEid] = useState("");
  const [eidMsg, setEidMsg] = useState<{ text: string; cls: "" | "y" | "n" }>({ text: "", cls: "" });
  const runEid = () => {
    if (!eid) return setEidMsg({ text: t.eidEmpty, cls: "n" });
    if (eid.length < 32) return setEidMsg({ text: t.eidShort(eid.length), cls: "n" });
    setEidMsg(eidValid(eid) ? { text: t.eidOk, cls: "y" } : { text: t.eidBad, cls: "n" });
  };
  const eidHint = eid.length > 0 && eid.length < 32 && !eidMsg.text ? t.eidCount(eid.length) : eidMsg.text;

  // ── tabs ──
  const [tab, setTab] = useState<TabKey>("p");
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const tabsRef = useRef<HTMLDivElement>(null);
  const [ind, setInd] = useState<{ x: number; w: number; h: number; y: number } | null>(null);
  const [ready, setReady] = useState(false);
  const place = useCallback(() => {
    const b = tabRefs.current[tab];
    if (b) setInd({ x: b.offsetLeft, y: b.offsetTop, w: b.offsetWidth, h: b.offsetHeight });
  }, [tab]);
  useLayoutEffect(() => {
    place();
    const id = window.requestAnimationFrame(() => setReady(true));
    return () => window.cancelAnimationFrame(id);
  }, [place]);
  useEffect(() => {
    window.addEventListener("resize", place);
    return () => window.removeEventListener("resize", place);
  }, [place]);
  const onTabKey = (e: React.KeyboardEvent) => {
    const i = TABS.findIndex((x) => x.key === tab);
    let n = -1;
    if (e.key === "ArrowRight") n = (i + 1) % TABS.length;
    else if (e.key === "ArrowLeft") n = (i - 1 + TABS.length) % TABS.length;
    else if (e.key === "Home") n = 0;
    else if (e.key === "End") n = TABS.length - 1;
    if (n < 0) return;
    e.preventDefault();
    setTab(TABS[n].key);
    tabRefs.current[TABS[n].key]?.focus();
  };

  // ── brands (several may be open) ──
  const [openBrands, setOpenBrands] = useState<Set<string>>(new Set());
  const toggleBrand = (id: string) =>
    setOpenBrands((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  // ── FAQ: one open at a time, height transition (spec 7) ──
  const [faqOpen, setFaqOpen] = useState<number | null>(null);
  const panels = useRef<(HTMLDivElement | null)[]>([]);
  const setFaq = (i: number) => {
    const next = faqOpen === i ? null : i;
    panels.current.forEach((p, j) => {
      if (!p) return;
      if (j === next) {
        p.style.height = `${p.scrollHeight}px`;
        window.setTimeout(() => {
          if (p.parentElement?.parentElement?.classList.contains("o")) p.style.height = "auto";
        }, 260);
      } else if (j === faqOpen) {
        p.style.height = `${p.scrollHeight}px`;
        void p.offsetHeight;
        p.style.height = "0px";
      }
    });
    setFaqOpen(next);
  };

  const showRegion = devName.startsWith("iPhone") && state !== "no" && state !== "pc";

  return (
    <div className="tbh">
      {SPRITE}
      <div className="top">
        <header className="hero">
          <nav className="bc" aria-label="Breadcrumb">
            <ol>
              <li>
                <a href={lang === "vi" ? "/" : "/en"}>{t.home}</a>
              </li>
              <li>
                <Ic id="i-ch" w={14} />
                <span aria-current="page">{t.crumb}</span>
              </li>
            </ol>
          </nav>
          <div className="hero-i">
            <h1>{t.h1}</h1>
            <p className="sub">{t.sub}</p>
            <div className="srch">
              <Ic id="i-s" w={24} />
              <input
                ref={inputRef}
                className="in"
                role="combobox"
                aria-expanded={open && norm(q).length >= 2}
                aria-controls="rl"
                aria-autocomplete="list"
                aria-activedescendant={active >= 0 ? `ro-${active}` : undefined}
                autoComplete="off"
                autoCapitalize="off"
                spellCheck={false}
                placeholder={t.search}
                aria-label={t.search}
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setOpen(true);
                }}
                onFocus={() => setOpen(true)}
                onBlur={() => window.setTimeout(() => setOpen(false), 150)}
                onKeyDown={onKey}
              />
              <button
                type="button"
                className="cx"
                aria-label={t.clear}
                hidden={!q}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  setQ("");
                  setOpen(false);
                  inputRef.current?.focus();
                }}
              >
                <Ic id="i-cx" />
              </button>
              <div className="rs" hidden={!open || norm(q).length < 2}>
                {grouped.length > 0 && stickyTab && (
                  <div className="rg" aria-hidden="true">
                    <Ic id={TABS.find((x) => x.key === stickyTab)!.icon} />
                    <span>{t.tabs[stickyTab]}</span>
                    <em>{grouped.find((g) => g.tab.key === stickyTab)?.items.length}</em>
                  </div>
                )}
                <div className="rl" id="rl" role="listbox" aria-label={t.results} ref={listRef} onScroll={onListScroll}>
                  {grouped.length === 0 ? (
                    <p className="rn">{t.none(q.trim())}</p>
                  ) : (
                    grouped.map((g, gi) => (
                      <div key={g.tab.key} data-g={g.tab.key} role="group" aria-label={t.tabs[g.tab.key]}>
                        {gi > 0 && (
                          <div className="rg" aria-hidden="true">
                            <Ic id={g.tab.icon} />
                            <span>{t.tabs[g.tab.key]}</span>
                            <em>{g.items.length}</em>
                          </div>
                        )}
                        {g.items.map((d) => {
                          const i = flat.indexOf(d);
                          return (
                            <button
                              key={`${d.brand}-${d.name}-${i}`}
                              type="button"
                              id={`ro-${i}`}
                              role="option"
                              aria-selected={i === active}
                              className={`ro${i === active ? " on" : ""}`}
                              onMouseDown={(e) => e.preventDefault()}
                              onClick={() => choose(i)}
                            >
                              <b>{d.name}</b>
                              <small>{d.brand}</small>
                            </button>
                          );
                        })}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="card" data-s={state} data-src={src}>
              <div aria-live="polite">
                <div className="dv">
                  <span className="st" aria-hidden="true" key={iconKey}>
                    <svg className="st-ok" viewBox="0 0 48 48" aria-hidden="true"><circle className="bk" cx="24" cy="24" r="22" /><circle className="rg2" cx="24" cy="24" r="21" /><path className="mk" d="M14 25l7 7 13-14" /></svg>
                    <svg className="st-no" viewBox="0 0 48 48" aria-hidden="true"><circle className="bk" cx="24" cy="24" r="22" /><circle className="rg2" cx="24" cy="24" r="21" /><path className="mk" d="M17 17l14 14M31 17L17 31" /></svg>
                    <svg className="st-unk" viewBox="0 0 48 48" aria-hidden="true"><circle className="bk" cx="24" cy="24" r="22" /><circle className="rg2" cx="24" cy="24" r="21" /><path className="mk" d="M19.5 19a4.7 4.7 0 1 1 6.5 4.3c-1.3.6-2 1.6-2 2.9M24 32v.1" /></svg>
                  </span>
                  <div className="dv-b">
                    <div className="dv-h">
                      <span className="dv-l">{label}</span>
                      <span className="bd">
                        <span className="b-ok">{t.badge.ok}</span>
                        <span className="b-no">{t.badge.no}</span>
                        <span className="b-unk">{t.badge.unk}</span>
                      </span>
                    </div>
                    <p className="dv-n">{devName}</p>
                    <p className="dv-m">{model ? t.model(model) : ""}</p>
                  </div>
                </div>
                <p className="dn">
                  <span className="n-ok">{t.note.ok}</span>
                  <span className="n-no">{t.note.no}</span>
                  <span className="n-unk">{t.note.unk}</span>
                  <span className="n-pc">{t.note.pc}</span>
                </p>
                <div className="dx" hidden={!showRegion}>
                  <button type="button" className="dxb" aria-expanded={region} aria-controls="dxp" onClick={() => setRegion((r) => !r)}>
                    <span>{t.region}</span>
                    <Ic id="i-d" />
                  </button>
                  <p id="dxp" hidden={!region}>
                    {t.regionText}
                  </p>
                </div>
                <a className="go" href={t.destinations}>
                  {t.go}
                </a>
                <div className="acts">
                  <button type="button" className="pk" hidden={state === "pc"} onClick={pickModel}>
                    {t.pick}
                  </button>
                  <button
                    type="button"
                    className="ag"
                    onClick={() => {
                      show({ state: "pc", name: t.pcName }, t.labelPc, "");
                      newSession();
                    }}
                  >
                    {t.other}
                  </button>
                </div>
                <p className="sn">
                  <Ic id="i-ok" />
                  {t.sent}
                </p>
                {notice && <p className="qn">{notice}</p>}
              </div>
              <div className="qr">
                <span className="qr-c" role="img" aria-label={t.qrLabel}>
                  {qrUrl ? <QRCodeSVG value={qrUrl} size={136} level="M" fgColor="#111" /> : null}
                </span>
                <div>
                  <ol>
                    {t.steps.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ol>
                  <p className="wt" role="status">
                    <i aria-hidden="true" />
                    {t.waiting}
                  </p>
                  <p className="qn">{t.qrNote}</p>
                </div>
              </div>
              <div className="ek">
                <button type="button" className="ekb" aria-expanded={eidOpen} aria-controls="ep" onClick={() => setEidOpen((o) => !o)}>
                  <span>{t.eid}</span>
                  <Ic id="i-d" w={20} />
                </button>
                <div className="ep" id="ep" hidden={!eidOpen}>
                  <p>
                    {t.eidHelp[0]}
                    <b>{t.eidHelp[1]}</b>
                    {t.eidHelp[2]}
                  </p>
                  <div className="er">
                    <input
                      className="ei"
                      inputMode="numeric"
                      autoComplete="off"
                      placeholder={t.eidPlaceholder}
                      aria-label={t.eidLabel}
                      aria-describedby="eo"
                      value={eid}
                      onChange={(e) => {
                        setEid(e.target.value.replace(/\D/g, "").slice(0, 32));
                        setEidMsg({ text: "", cls: "" });
                      }}
                      onKeyDown={(e) => e.key === "Enter" && runEid()}
                    />
                    <button type="button" className="eg" disabled={eid.length !== 32} onClick={runEid}>
                      {t.eidCheck}
                    </button>
                  </div>
                  <p className={`eo${eidMsg.cls ? ` ${eidMsg.cls}` : ""}`} id="eo" role="status">
                    {eidHint}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>
      </div>

      <main>
        <div className="col">
          <div className={`tabs${ready ? " rd" : ""}`} role="tablist" aria-label={t.tabList} ref={tabsRef} onKeyDown={onTabKey}>
            <i
              className="ind"
              aria-hidden="true"
              style={ind ? { width: ind.w, height: ind.h, transform: `translate(${ind.x}px, ${ind.y}px)` } : undefined}
            />
            {TABS.map((x) => (
              <button
                key={x.key}
                ref={(el) => {
                  tabRefs.current[x.key] = el;
                }}
                className={`tb${tab === x.key ? " on" : ""}`}
                role="tab"
                type="button"
                id={`tb-${x.key}`}
                aria-selected={tab === x.key}
                aria-controls={`pn-${x.key}`}
                tabIndex={tab === x.key ? 0 : -1}
                onClick={() => setTab(x.key)}
              >
                <Ic id={x.icon} />
                {t.tabs[x.key]}
              </button>
            ))}
          </div>
          {TABS.map((x) => {
            const g = byTab.get(x.key);
            return (
              <section className="pn" id={`pn-${x.key}`} role="tabpanel" aria-labelledby={`tb-${x.key}`} hidden={tab !== x.key} key={x.key}>
                <div className="ph-h">
                  <div className="ph">
                    <Ic id={x.icon} w={24} />
                  </div>
                  <h2>{t.tabs[x.key]}</h2>
                </div>
                <p className="lead">{t.leads[x.key]}</p>
                {(g?.notes ?? []).map((n) => (
                  <p className="nt tn" key={n}>
                    <Ic id="i-info" w={18} />
                    <span>{n}</span>
                  </p>
                ))}
                {(g?.manufacturers ?? []).map((b, i) => {
                  const id = `${x.key}${i}`;
                  const isOpen = openBrands.has(id);
                  return (
                    <div className="ac" key={b.manufacturer}>
                      <h3>
                        <button type="button" className="ab" id={`b-${id}`} aria-expanded={isOpen} aria-controls={`p-${id}`} onClick={() => toggleBrand(id)}>
                          <span>{b.manufacturer}</span>
                          <Ic id="i-d" w={20} />
                        </button>
                      </h3>
                      <div className="ap" id={`p-${id}`} role="region" aria-labelledby={`b-${id}`} hidden={!isOpen}>
                        <ul className="mo">
                          {b.devices.map((d) => (
                            <li key={d.id}>{d.device}</li>
                          ))}
                        </ul>
                        {(b.notes ?? []).map((n) => (
                          <p className="nt" key={n}>
                            <Ic id="i-info" w={18} />
                            <span>{n}</span>
                          </p>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </section>
            );
          })}

          {faqs.length > 0 && (
            <section className="fa" aria-labelledby="faqh">
              <h2 id="faqh">{t.faq}</h2>
              {faqs.map((f, i) => (
                <div className={`fq${faqOpen === i ? " o" : ""}`} key={f.question} onClick={(e) => {
                  const target = e.target as HTMLElement;
                  if (target.closest("a") || window.getSelection()?.toString()) return;
                  setFaq(i);
                }}>
                  <div className="ft">
                    <h3>
                      <button type="button" className="fb" id={`fb${i}`} aria-expanded={faqOpen === i} aria-controls={`fp${i}`}>
                        <span>{f.question}</span>
                        <Ic id="ic-sc" w={24} />
                      </button>
                    </h3>
                    <div
                      className="fp"
                      id={`fp${i}`}
                      role="region"
                      aria-labelledby={`fb${i}`}
                      ref={(el) => {
                        panels.current[i] = el;
                      }}
                      dangerouslySetInnerHTML={{ __html: f.answer }}
                    />
                  </div>
                </div>
              ))}
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
