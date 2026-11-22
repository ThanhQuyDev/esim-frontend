"use client";

import { Children, cloneElement, isValidElement, useEffect, useLayoutEffect, useRef, useState, type ReactElement, type ReactNode } from "react";
import { useT } from "./design-i18n";
import { Ic } from "./nd-icons";
import { Overlay } from "./nd-parts";

/**
 * Pieces the v40/v24/v55 phone designs share (vande-2011 #032): the product
 * description cut to two lines with "Xem thêm / Thu gọn" (spec A3, B11), and
 * the "Chi tiết eSIM …" popup opened from the buy bar (spec A9, B8.4).
 */

/** The one `<p className="m-desc">` inside, two lines until opened. The button shows only when text is cut. */
export function ClampDesc({ children }: { children: ReactNode }) {
  const tx = useT();
  const ref = useRef<HTMLParagraphElement>(null);
  const [open, setOpen] = useState(false);
  const [cut, setCut] = useState(false);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || open) return;
    const check = () => setCut(el.scrollHeight > el.clientHeight + 1);
    check();
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(check) : null;
    ro?.observe(el);
    return () => ro?.disconnect();
  }, [open, children]);
  const only = Children.toArray(children).find(isValidElement) as ReactElement<{ className?: string }> | undefined;
  if (!only) return null;
  const p = cloneElement(only as ReactElement<Record<string, unknown>>, {
    ref,
    id: "mDesc",
    className: `${only.props.className ?? "m-desc"}${open ? "" : " is-clamp"}`,
  });
  return (
    <>
      {p}
      {(cut || open) && (
        <button type="button" className="m-more" id="mMore" aria-expanded={open} aria-controls="mDesc" onClick={() => setOpen((o) => !o)}>
          {open ? tx("Thu gọn") : tx("Xem thêm")}
        </button>
      )}
    </>
  );
}

/**
 * "Chi tiết eSIM …": two tabs, the popup as tall as the taller one so it
 * does not jump when the tab changes (spec A9).
 */
export function SpecModal({
  open,
  onClose,
  title,
  planLine,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  planLine: string;
  children: (tab: 0 | 1) => ReactNode;
}) {
  const tx = useT();
  const [tab, setTab] = useState<0 | 1>(0);
  const body = useRef<HTMLDivElement>(null);
  const [minH, setMinH] = useState<number | undefined>(undefined);
  useEffect(() => {
    if (open) setTab(0);
  }, [open]);
  useLayoutEffect(() => {
    const el = body.current;
    if (!open || !el) return;
    let h = 0;
    el.querySelectorAll<HTMLElement>(".dt-pane").forEach((pane) => {
      const was = pane.hidden;
      pane.hidden = false;
      h = Math.max(h, pane.offsetHeight);
      pane.hidden = was;
    });
    const cs = getComputedStyle(el);
    setMinH(Math.ceil(h + parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom)));
  }, [open, planLine]);
  const tabs: [string, string][] = [
    ["ic-gear", tx("Tính năng eSIM")],
    ["ic-box", tx("Giao hàng & Kích hoạt")],
  ];
  return (
    <Overlay id="specOv" open={open} onClose={onClose}>
      <div className="modal modal--spec" role="dialog" aria-labelledby="specT" aria-modal="true">
        <div className="modal-hd">
          <div className="modal-top">
            <div>
              <div className="modal-title modal-title--sm" id="specT">
                {title}
              </div>
              <p className="modal-desc" id="specPlan">
                {planLine}
              </p>
            </div>
            <button className="btn-close" type="button" aria-label={tx("Đóng")} data-close="">
              <Ic name="ic-x" w={24} />
            </button>
          </div>
          <div className="dt-tabs" role="tablist" aria-label={tx("Chi tiết eSIM")}>
            {tabs.map(([ic, t], i) => (
              <button
                key={ic}
                className="dt-tab"
                type="button"
                id={`tab-sp${i}`}
                aria-controls={`sp${i}`}
                aria-selected={tab === i}
                tabIndex={tab === i ? 0 : -1}
                role="tab"
                onClick={() => setTab(i as 0 | 1)}
                onKeyDown={(e) => {
                  if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
                    e.preventDefault();
                    const next = (1 - i) as 0 | 1;
                    setTab(next);
                    document.getElementById(`tab-sp${next}`)?.focus();
                  }
                }}
              >
                <Ic name={ic} w={13} />
                {t}
              </button>
            ))}
          </div>
        </div>
        <div className="modal-body" ref={body} style={minH ? { minHeight: minH } : undefined}>
          {([0, 1] as const).map((i) => (
            <div key={i} className="dt-pane" id={`sp${i}`} role="tabpanel" aria-labelledby={`tab-sp${i}`} hidden={tab !== i}>
              <h2 className="sr-only">{tabs[i][1]}</h2>
              {children(i)}
            </div>
          ))}
        </div>
      </div>
    </Overlay>
  );
}
