import { useEffect, type RefObject } from "react";

/**
 * What the product pages' bottom bar and voucher popup share, country, region
 * and domestic alike (vande-0411 #069).
 */

/** The screen's bottom edge has reached the footer: the bar steps aside. */
export function footerReached(): boolean {
  const footer = document.querySelector("footer");
  return !!footer && footer.getBoundingClientRect().top < innerHeight;
}

/** The chat button rides above the bar while it shows. */
export function useChatAboveBar(bar: RefObject<HTMLElement>, show: boolean): void {
  useEffect(() => {
    const root = document.documentElement;
    const height = show ? bar.current?.offsetHeight ?? 0 : 0;
    root.style.setProperty("--buy-bar-h", `${height}px`);
    return () => {
      root.style.removeProperty("--buy-bar-h");
    };
  }, [bar, show]);
}

/** The popup's arrow points at the button that opened it, as in the design. */
export function useVoucherArrow(open: unknown): void {
  useEffect(() => {
    if (!open) return;
    const aim = () => {
      const pop = document.getElementById("vchPop");
      const trigger = document.querySelector('[data-vpop][aria-expanded="true"]');
      if (!pop || !trigger) return;
      const target = (trigger.querySelector(".pv-lbl") ?? trigger).getBoundingClientRect();
      pop.style.setProperty(
        "--cx",
        `${Math.round(target.left + target.width / 2 - pop.getBoundingClientRect().left)}px`
      );
    };
    aim();
    addEventListener("resize", aim);
    return () => removeEventListener("resize", aim);
  }, [open]);
}

/** From the bottom bar: up to the price at the top, with the popup in view. */
export function scrollToVoucherPopup(): void {
  requestAnimationFrame(() => {
    const tag = document.getElementById("vchTag");
    const pop = document.getElementById("vchPop");
    if (!tag || !pop) return;
    const top = tag.getBoundingClientRect().top;
    const height = pop.getBoundingClientRect().bottom - top;
    const smooth = !matchMedia("(prefers-reduced-motion: reduce)").matches;
    scrollBy({
      top: top - Math.max(16, (innerHeight - height) / 2),
      behavior: smooth ? "smooth" : "auto",
    });
  });
}
