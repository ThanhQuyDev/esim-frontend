"use client";

import { nonHkIpCopy } from "@/lib/plan-nonhkip";

interface NonHkIpToggleProps {
  active: boolean;
  onToggle: (next: boolean) => void;
  lang: string;
  /** No plan survived the filter — say so instead of showing an empty list. */
  empty?: boolean;
}

/**
 * Opt-in filter for local-exit-IP ("nonhkip") plans — see lib/plan-nonhkip.ts.
 *
 * Off by default: these plans are more expensive, so surfacing them is the
 * customer's choice, not ours (#041).
 */
export function NonHkIpToggle({
  active,
  onToggle,
  lang,
  empty = false,
}: NonHkIpToggleProps) {
  const copy = nonHkIpCopy(lang);

  return (
    <div className="mb-4">
      <button
        type="button"
        role="switch"
        aria-checked={active}
        onClick={() => onToggle(!active)}
        data-testid="nonhkip-toggle"
        className={`inline-flex items-center gap-2 rounded-[30px] border px-[15px] py-[9px] text-[.875rem] font-medium transition-colors cursor-pointer ${
          active
            ? "border-[#1a1a1a] bg-white text-[#1a1a1a] font-semibold shadow-[0_0_0_1px_#1a1a1a]"
            : "border-[#e5e7eb] bg-white text-[#374151] hover:border-[#9ca3af] hover:bg-[#f3f4f6]"
        }`}
      >
        <span
          aria-hidden
          className={`relative inline-block h-[18px] w-[32px] shrink-0 rounded-full transition-colors ${
            active ? "bg-[#16a34a]" : "bg-[#d1d5db]"
          }`}
        >
          <span
            className={`absolute top-[2px] h-[14px] w-[14px] rounded-full bg-white transition-all ${
              active ? "left-[16px]" : "left-[2px]"
            }`}
          />
        </span>
        {copy.toggle}
      </button>

      <p
        className="mt-2 text-[.75rem] leading-[1.5] text-[#6b7280]"
        data-testid="nonhkip-hint"
      >
        {active ? copy.activeHint : copy.hint}
      </p>

      {active && empty && (
        <p
          className="mt-1 text-[.75rem] font-medium text-[#b91c1c]"
          data-testid="nonhkip-empty"
        >
          {copy.empty}
        </p>
      )}
    </div>
  );
}
