"use client";

import { useEffect, useMemo, useState, type KeyboardEvent } from "react";
import { QRCodeSVG } from "qrcode.react";
import type { Verdict } from "../../supported-devices/design/device-detect";
import { useOwnDevice, useQrHandoff } from "../../supported-devices/design/device-handoff";
import { useT } from "./design-i18n";
import { Ic } from "./nd-icons";
import { DeviceCheck, useDeviceList, type Brand } from "./nd-parts";

/**
 * The product pages' device check from the v46/v40 designs (vande-2011 #032,
 * spec A8, B9.8): on a computer two tabs, "Kiểm tra tự động" with a QR code
 * that opens this page on the phone, and "Kiểm tra thủ công" (brand / model,
 * *#06#); on a phone the box under the price naming the phone in hand.
 */

type Shown = "ok" | "no" | "unk";

/** The browser never says which iPhone it is: "Chưa chắc chắn", as the design draws it. */
function shownState(v: Verdict): Shown {
  if (/^iP(hone|ad)\b/.test(v.name)) return "unk";
  return v.state === "ok" || v.state === "no" ? v.state : "unk";
}

const COPY: Record<Shown, { badge: string; note: string; go: string; icon: string; line: string }> = {
  ok: {
    badge: "Được hỗ trợ",
    note: "Máy này dùng được eSIM. Máy cần được mua chính hãng hoặc đã mở khóa mạng.",
    go: "Không đúng máy của bạn?",
    icon: "ic-check-circle",
    line: "đã hỗ trợ eSIM",
  },
  no: {
    badge: "Không hỗ trợ",
    note: "Máy này chưa nằm trong danh sách hỗ trợ eSIM. Bạn có thể cài eSIM trên một máy khác.",
    go: "Kiểm tra điện thoại khác",
    icon: "ic-warning",
    line: "chưa hỗ trợ eSIM",
  },
  unk: {
    badge: "Chưa chắc chắn",
    note: "Trình duyệt không cho biết chính xác đời máy. Hãy chọn đúng kiểu máy hoặc bấm *#06# để kiểm tra.",
    go: "Chọn đời máy của bạn",
    icon: "ic-warning",
    line: "chưa chắc chắn có hỗ trợ eSIM",
  },
};
const IPHONE_NOTE =
  "Trình duyệt không cho biết chính xác đời máy. iPhone mua tại Trung Quốc đại lục, Hồng Kông hoặc Ma Cao thường không có eSIM — hãy kiểm tra bằng *#06#.";

function copyFor(v: Verdict) {
  const s = shownState(v);
  const c = COPY[s];
  return { state: s, ...c, note: s === "unk" && /^iP(hone|ad)\b/.test(v.name) ? IPHONE_NOTE : c.note };
}

/** Supported names for matching the phone in hand ("Samsung Galaxy S24 Ultra"). */
function useNames(lang: string): string[] {
  const list = useDeviceList(lang);
  return useMemo(() => list.map((d) => d.name), [list]);
}

export type QrHandoff = ReturnType<typeof useQrHandoff>;
export { useQrHandoff };

/** Desktop: the tabs and panes inside `#dcCard`, under its title. */
export function DeviceCheckTabs({
  lang,
  pageName,
  qr,
  onAll,
  flash,
}: {
  lang: string;
  /** "eSIM Trung Quốc" — step 2 says the QR opens this very page. */
  pageName: string;
  qr: QrHandoff;
  onAll: (brand: Brand | "") => void;
  flash?: number;
}) {
  const tx = useT();
  const [tab, setTab] = useState<1 | 2>(1);
  // A scan brings the automatic tab forward (the design's g(1)).
  useEffect(() => {
    if (qr.result) setTab(1);
  }, [qr.result]);
  const r = qr.result ? copyFor(qr.result) : null;
  const pick = (t: 1 | 2, focus?: boolean) => {
    setTab(t);
    if (focus) document.getElementById(t === 1 ? "dcT1" : "dcT2")?.focus();
  };
  const keys = (e: KeyboardEvent) => {
    if (!["ArrowRight", "ArrowLeft", "Home", "End"].includes(e.key)) return;
    e.preventDefault();
    pick(e.key === "ArrowLeft" || e.key === "Home" ? 1 : 2, true);
  };
  return (
    <>
      <div className="dc-tabs" role="tablist" aria-label={tx("Cách kiểm tra thiết bị")}>
        <button className="dc-tab" type="button" role="tab" id="dcT1" aria-selected={tab === 1} aria-controls="dcP1" tabIndex={tab === 1 ? 0 : -1} onClick={() => pick(1)} onKeyDown={keys}>
          {tx("Kiểm tra tự động")}
        </button>
        <button className="dc-tab" type="button" role="tab" id="dcT2" aria-selected={tab === 2} aria-controls="dcP2" tabIndex={tab === 2 ? 0 : -1} onClick={() => pick(2)} onKeyDown={keys}>
          {tx("Kiểm tra thủ công")}
        </button>
      </div>{" "}
      <div className="dc-pane dq" id="dcP1" role="tabpanel" aria-labelledby="dcT1" data-qs={r ? r.state : "wait"} hidden={tab !== 1}>
        <div className="dq-wait">
          <div className="dq-qr" role="img" aria-label={tx("Mã QR kiểm tra thiết bị hỗ trợ eSIM")}>
            {qr.qrUrl ? <QRCodeSVG value={qr.qrUrl} size={116} level="M" fgColor="#000" className="segno" /> : null}
          </div>
          <div className="dq-t">
            <ol className="dq-steps">
              <li>{tx("Mở camera trên điện thoại bạn định cài eSIM.")}</li>
              <li>{tx("Quét mã QR — mở đúng trang {0} này trên điện thoại.", pageName)}</li>
              <li>{tx("Kết quả hiện tại đây, bạn không cần nhập gì.")}</li>
            </ol>
            <p className="dq-live" role="status">
              <span className="dq-dot" aria-hidden="true" />
              {tx("Đang chờ bạn quét…")}
            </p>
          </div>
        </div>{" "}
        <p className="dq-priv">{tx("Chỉ đọc tên và đời máy, không lấy dữ liệu cá nhân.")}</p>{" "}
        <div className="dq-res" id="dqRes" hidden={!r} role="status" aria-live="polite" data-s={r?.state ?? "ok"}>
          <div className="dq-rh">
            <span className="dq-ck" aria-hidden="true">
              <Ic name={r?.icon ?? "ic-check-circle"} w={16} />
            </span>
            <span className="dq-k">{tx("Điện thoại bạn vừa quét")}</span>
          </div>
          <div className="dq-row">
            <b className="dq-name">{qr.result?.name}</b>
            <span className="dq-badge">{r ? tx(r.badge) : ""}</span>
          </div>
          <p className="dq-note">{r ? tx(r.note) : ""}</p>
          <div className="dq-act">
            <button className="dq-again" type="button" id="dqAgain" onClick={qr.again}>
              {tx("Kiểm tra điện thoại khác")}
            </button>
          </div>
        </div>
      </div>{" "}
      <div className="dc-pane" id="dcP2" role="tabpanel" aria-labelledby="dcT2" hidden={tab !== 2}>
        <DeviceCheck lang={lang} onAll={onAll} flash={flash} />
      </div>
    </>
  );
}

/** Desktop: the line under the buy row, telling the scan's result (spec A8). */
export function DevNote({ qr, onGo }: { qr: QrHandoff; onGo: () => void }) {
  const tx = useT();
  const r = qr.result ? copyFor(qr.result) : null;
  return (
    <p className="dev-note dev-note--lined" id="dvm" data-s={r?.state ?? "wait"}>
      <Ic name={r?.icon ?? "ic-info-i"} w={14} />
      <span id="dvmT">
        {r ? (
          <>
            {tx("Điện thoại vừa quét:")} <b>{qr.result?.name}</b> — {tx(r.line)}.
          </>
        ) : (
          tx("Vui lòng kiểm tra thiết bị có hỗ trợ eSIM trước khi thanh toán.")
        )}
      </span>
      <button className="dev-go" type="button" id="dvmB" onClick={onGo}>
        {r ? tx("Xem chi tiết") : tx("Kiểm tra ngay")}
        <Ic name="ic-chev-right" w={13} />
      </button>
    </p>
  );
}

/** Mobile: "Có vẻ thiết bị của bạn là …" under the price (`#dvn`). */
export function DeviceNow({ lang, onGo }: { lang: string; onGo: () => void }) {
  const tx = useT();
  const v = useOwnDevice(useNames(lang), tx("Điện thoại Android"));
  if (!v) return null;
  const c = copyFor(v);
  return (
    <div className="dvn" id="dvn" role="status" aria-live="polite" data-s={c.state}>
      <div className="dvn-b">
        <span className="dvn-k">{tx("Có vẻ thiết bị của bạn là")}</span>
        <span className="dvn-n">{v.name}</span>
        <span className="dvn-t">
          <Ic name={c.icon} w={12} />
          {tx(c.badge)}
        </span>
        <span className="dvn-s">{tx(c.note)}</span>
        <button className="dvn-a" type="button" data-devgo="" onClick={onGo}>
          {tx(c.go)}
        </button>
      </div>
    </div>
  );
}

/** A phone opened from the desktop's QR code on a page with no `DeviceNow` still answers. */
export function DeviceAnswer({ lang }: { lang: string }) {
  const tx = useT();
  useOwnDevice(useNames(lang), tx("Điện thoại Android"));
  return null;
}
