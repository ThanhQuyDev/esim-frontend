/**
 * What the browser can tell about the device it runs on (vande-2011 #031,
 * spec section 9), and the verdict against the supported list (section 11).
 *
 * Never guesses: no browser on an iPhone says which iPhone it is, so the page
 * says "iPhone" rather than a wrong model; an Android phone that gives no
 * model is "unknown". Nothing here identifies the visitor.
 */

export type CheckState = "ok" | "no" | "unk" | "pc";

export type DeviceInfo = {
  type: "phone" | "tablet" | "desktop" | "unknown";
  name: string;
  model: string;
  os: string;
  osVersion: string;
};

type UAData = {
  mobile?: boolean;
  platform?: string;
  getHighEntropyValues?: (hints: string[]) => Promise<Record<string, string>>;
};

export async function getDeviceInfo(): Promise<DeviceInfo> {
  const nav = navigator as Navigator & { userAgentData?: UAData };
  const ua = nav.userAgent;
  const info: DeviceInfo = { type: "unknown", name: "", model: "", os: "", osVersion: "" };

  if (/iPhone/.test(ua)) {
    const m = /OS (\d+)[_ ]/.exec(ua);
    return { ...info, type: "phone", name: "iPhone", os: "iOS", osVersion: m ? m[1] : "" };
  }
  if (/iPad/.test(ua) || (nav.platform === "MacIntel" && nav.maxTouchPoints > 1)) {
    const m = /OS (\d+)[_ ]/.exec(ua);
    return { ...info, type: "tablet", name: "iPad", os: "iPadOS", osVersion: m ? m[1] : "" };
  }

  const d = nav.userAgentData;
  if (d) {
    info.type = d.mobile ? "phone" : /Android/i.test(d.platform ?? "") ? "tablet" : "desktop";
    info.os = d.platform ?? "";
    try {
      const h = (await d.getHighEntropyValues?.(["model", "platformVersion"])) ?? {};
      info.model = (h.model ?? "").trim();
      info.osVersion = (h.platformVersion ?? "").split(".")[0];
    } catch {
      /* the browser may refuse; stay with what we have */
    }
    if (/Android/i.test(info.os)) return info;
    if (info.type === "desktop") return info;
  }

  if (/Android/.test(ua)) {
    const f = /Android ([\d.]+); ([^;)]+)/.exec(ua);
    const model = f && f[2] !== "K" ? f[2].trim() : info.model;
    return {
      ...info,
      type: /Mobile/.test(ua) ? "phone" : "tablet",
      os: "Android",
      osVersion: info.osVersion || (f ? f[1].split(".")[0] : ""),
      model,
    };
  }
  return { ...info, type: "desktop" };
}

/** Lower case, no marks, `đ` → `d`, anything else a single space. */
export function norm(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export type Verdict = {
  state: CheckState;
  /** "iPhone", "Google Pixel 8 · Android 15". */
  name: string;
  /** "SM-S928B" when the browser gave a model code. */
  model?: string | null;
};

const NBSP = " ";

/** `{name} · {OS version}`, the dot glued to what follows (spec 8.4). */
function withOs(name: string, os: string, version: string): string {
  return version ? `${name}${NBSP}·${NBSP}${os}${NBSP}${version}` : name;
}

/**
 * The verdict for this device against the supported list (spec 11): by
 * model when the browser gives one, by name otherwise; unknown when unsure.
 */
export function verdictFor(info: DeviceInfo, devices: string[], phoneLabel: string): Verdict {
  if (info.type === "desktop") return { state: "pc", name: "" };
  if (info.name === "iPhone" || info.name === "iPad") {
    const major = Number(info.osVersion);
    return { state: major >= 17 ? "ok" : "unk", name: info.name };
  }
  if (/android/i.test(info.os)) {
    const model = info.model;
    if (!model) return { state: "unk", name: withOs(phoneLabel, "Android", info.osVersion) };
    const key = norm(model);
    const hit = devices.find((d) => {
      const n = norm(d.replace(/\(.*?\)/g, ""));
      return n === key || n.endsWith(` ${key}`);
    });
    if (hit) {
      return { state: "ok", name: withOs(hit.replace(/\s*\(.*?\)\s*/g, " ").trim(), "Android", info.osVersion), model };
    }
    // A hardware code (SM-S928B) we cannot read as a name: unsure, not "no".
    return { state: "unk", name: withOs(phoneLabel, "Android", info.osVersion), model };
  }
  return { state: "unk", name: phoneLabel };
}

/** GSMA EID: 32 digits, mod 97 = 1 (spec 8.6). */
export function eidValid(digits: string): boolean {
  if (!/^\d{32}$/.test(digits)) return false;
  let r = 0;
  for (const ch of digits) r = (r * 10 + Number(ch)) % 97;
  return r === 1;
}
