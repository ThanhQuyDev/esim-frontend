"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy, Loader2 } from "lucide-react";
import { useOrderByNumber, formatVnd, type BankTransferCheckoutResponse } from "@/lib/hooks";

interface BankTransferPanelProps {
  /** Payment instructions returned by the bank-transfer checkout endpoint. */
  info: BankTransferCheckoutResponse;
  lang: "vi" | "en";
  /** Called once the order is confirmed paid (webhook processed). */
  onPaid?: (orderNumber: string) => void;
}

const TEXT = {
  vi: {
    title: "Chuyển khoản ngân hàng",
    subtitle: "Quét mã QR bằng app ngân hàng, hoặc chuyển khoản thủ công theo thông tin bên dưới.",
    bank: "Ngân hàng",
    account: "Số tài khoản",
    holder: "Chủ tài khoản",
    amount: "Số tiền",
    memo: "Nội dung chuyển khoản",
    memoWarning:
      "Bắt buộc ghi đúng nội dung này để hệ thống tự động xác nhận. Ghi sai sẽ phải đối soát thủ công.",
    waiting: "Đang chờ nhận tiền…",
    waitingHint: "Sau khi bạn chuyển khoản, hệ thống sẽ tự động xác nhận trong vài giây.",
    paid: "Đã nhận được thanh toán!",
    copied: "Đã sao chép",
    copy: "Sao chép",
  },
  en: {
    title: "Bank transfer",
    subtitle: "Scan the QR with your banking app, or transfer manually using the details below.",
    bank: "Bank",
    account: "Account number",
    holder: "Account holder",
    amount: "Amount",
    memo: "Transfer memo",
    memoWarning:
      "You must include this exact memo so we can confirm automatically. A wrong memo needs manual reconciliation.",
    waiting: "Waiting for your transfer…",
    waitingHint: "Once you transfer, we confirm automatically within seconds.",
    paid: "Payment received!",
    copied: "Copied",
    copy: "Copy",
  },
} as const;

function CopyRow({
  label,
  value,
  mono,
  highlight,
  copyLabel,
  copiedLabel,
}: {
  label: string;
  value: string;
  mono?: boolean;
  highlight?: boolean;
  copyLabel: string;
  copiedLabel: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard unavailable — user can still select the text */
    }
  };

  return (
    <div
      className={`flex items-center justify-between gap-3 rounded-xl border px-3.5 py-2.5 ${
        highlight ? "border-[#F5C518] bg-[#FEF9E7]" : "border-[#e5e7eb] bg-white"
      }`}
    >
      <div className="min-w-0">
        <p className="text-[12px] text-[#6b7280]">{label}</p>
        <p className={`text-[15px] font-semibold text-[#111] truncate ${mono ? "font-mono tracking-wide" : ""}`}>
          {value}
        </p>
      </div>
      <button
        type="button"
        onClick={handleCopy}
        className="shrink-0 inline-flex items-center gap-1.5 rounded-lg border border-[#e5e7eb] bg-white px-2.5 py-1.5 text-[12px] font-medium text-[#374151] hover:bg-gray-50 transition-colors"
      >
        {copied ? <Check className="w-3.5 h-3.5 text-[#16A34A]" /> : <Copy className="w-3.5 h-3.5" />}
        {copied ? copiedLabel : copyLabel}
      </button>
    </div>
  );
}

/**
 * Bank-transfer payment panel: shows the VietQR plus the exact transfer details
 * and polls the order until SePay's webhook marks it paid.
 */
export function BankTransferPanel({ info, lang, onPaid }: BankTransferPanelProps) {
  const t = TEXT[lang];
  const orderNumber = info.orderNumber ?? info.orderId ?? "";

  const { data: order } = useOrderByNumber(orderNumber, !!orderNumber);
  const isPaid =
    order?.status === "paid" ||
    order?.status === "completed" ||
    (order?.items?.some((i) => i.esims && i.esims.length > 0) ?? false);

  // Notify once, in an effect — calling the callback during render would fire
  // on every re-render (and breaks React's render purity).
  const notifiedRef = useRef(false);
  useEffect(() => {
    if (isPaid && orderNumber && !notifiedRef.current) {
      notifiedRef.current = true;
      onPaid?.(orderNumber);
    }
  }, [isPaid, orderNumber, onPaid]);

  return (
    <div className="rounded-2xl border border-[#e5e7eb] bg-white p-5" data-testid="bank-transfer-panel">
      <h3 className="text-lg font-bold text-[#111] mb-1">{t.title}</h3>
      <p className="text-[13px] text-[#6b7280] mb-4">{t.subtitle}</p>

      <div className="grid sm:grid-cols-[200px_minmax(0,1fr)] gap-5">
        {/* VietQR */}
        <div className="shrink-0">
          {info.qrUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={info.qrUrl}
              alt="VietQR"
              width={200}
              height={200}
              className="w-full max-w-[200px] rounded-xl border border-[#e5e7eb]"
              data-testid="bank-transfer-qr"
            />
          ) : null}
        </div>

        {/* Details */}
        <div className="flex flex-col gap-2.5 min-w-0">
          <CopyRow label={t.bank} value={info.bankCode} copyLabel={t.copy} copiedLabel={t.copied} />
          <CopyRow label={t.account} value={info.accountNumber} mono copyLabel={t.copy} copiedLabel={t.copied} />
          <CopyRow label={t.holder} value={info.accountName} copyLabel={t.copy} copiedLabel={t.copied} />
          <CopyRow label={t.amount} value={formatVnd(info.amount)} copyLabel={t.copy} copiedLabel={t.copied} />
          <CopyRow
            label={t.memo}
            value={info.bankTransferCode}
            mono
            highlight
            copyLabel={t.copy}
            copiedLabel={t.copied}
          />
          <p className="text-[12px] text-[#92400E] bg-[#FEF9E7] border border-[#F5C518] rounded-lg px-3 py-2">
            ⚠ {t.memoWarning}
          </p>
        </div>
      </div>

      {/* Status */}
      <div className="mt-5 border-t border-[#f3f4f6] pt-4">
        {isPaid ? (
          <div className="flex items-center gap-2 text-[#16A34A] font-semibold" data-testid="bank-transfer-paid">
            <Check className="w-5 h-5" />
            {t.paid}
          </div>
        ) : (
          <div className="flex items-start gap-2.5" data-testid="bank-transfer-waiting">
            <Loader2 className="w-5 h-5 animate-spin text-[#6b7280] shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-[#111]">{t.waiting}</p>
              <p className="text-[13px] text-[#6b7280]">{t.waitingHint}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
