/**
 * The admin's "Ghi chú" at the top of a destination / region page
 * (doitac-1410 #078). `html` comes from `entityNoticeHtml`, already cleaned.
 */
export function EntityNotice({ html, className = "" }: { html: string | null; className?: string }) {
  if (!html) return null;
  return (
    <div className={`md:max-w-[768px] lg:max-w-[1024px] xl:max-w-[1168px] px-4 sm:px-0 mx-auto ${className}`}>
      <div
        role="note"
        data-testid="entity-notice"
        className="flex items-start gap-3 rounded-xl border border-[#BFDBFE] bg-[#EFF6FF] px-4 py-3"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#2563EB"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mt-0.5 shrink-0"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
        <div
          className="min-w-0 break-words text-[.875rem] leading-[1.6] text-[#1E3A8A] [&_a]:font-semibold [&_a]:text-[#1D4ED8] [&_a]:underline [&_p+p]:mt-1 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    </div>
  );
}
