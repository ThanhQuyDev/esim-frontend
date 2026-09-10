import { planVoiceLabel, type PlanVoiceDict, type PlanVoiceInfo } from "@/lib/plan-voice";

interface VoiceFeatureRowProps {
  label: string;
  info: PlanVoiceInfo;
  dict: PlanVoiceDict & { yes: string; no: string };
  /** Mobile panel uses a slightly smaller type scale than the desktop one. */
  compact?: boolean;
}

const XIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const CheckIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const PhoneIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#1D4ED8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6A19.79 19.79 0 012.12 4.18 2 2 0 014.11 2h3a2 2 0 012 1.72c.13.96.36 1.9.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0122 16.92z" />
  </svg>
);

/**
 * The "Calls & SMS" row of the feature panel, showing the actual allowance
 * ("50 phút gọi · 100 tin nhắn SMS") instead of a bare Yes (#045).
 *
 * Falls back to the same red "No" as the other rows when the plan has neither.
 */
export function VoiceFeatureRow({
  label,
  info,
  dict,
  compact = false,
}: VoiceFeatureRowProps) {
  const value = planVoiceLabel(info, dict);
  const labelSize = compact ? "text-sm" : "text-base sm:text-sm";

  return (
    <div className="flex items-center justify-between py-[13px] border-b border-[#f3f4f6] last:border-b-0 gap-3">
      <span className={`${labelSize} text-[#374151]`}>{label}</span>
      {value ? (
        <span
          data-testid="voice-allowance"
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold whitespace-nowrap"
          style={{ background: "#EFF6FF", color: "#1D4ED8", border: "1.5px solid #BFDBFE" }}
        >
          <PhoneIcon />
          {value}
        </span>
      ) : info.hasVoice ? (
        /* Included, but the provider gave no usable figure — say yes, don't
           invent an allowance. */
        <span
          data-testid="voice-yes"
          className="inline-flex items-center gap-[5px] text-sm font-semibold text-[#16A34A]"
        >
          <CheckIcon />
          {dict.yes}
        </span>
      ) : (
        <span className="inline-flex items-center gap-[5px] text-sm font-semibold text-[#DC2626]">
          <XIcon />
          {dict.no}
        </span>
      )}
    </div>
  );
}
