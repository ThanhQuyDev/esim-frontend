/**
 * The backend writes a wallet transaction's reason in English, and the rows
 * already stored stay that way, so the customer's Vietnamese page translates the
 * ones it knows (vande-0411 #080). An admin's own note passes through as typed.
 */
const VI: { match: RegExp; text: (m: RegExpMatchArray) => string }[] = [
  { match: /^Use eXu for order payment$/i, text: () => "Dùng eXU thanh toán đơn hàng" },
  {
    match: /^([\d.]+)% eXu cashback for paid order$/i,
    text: (m) => `Hoàn ${m[1]}% eXU cho đơn đã thanh toán`,
  },
  {
    match: /^Referral reward for successful first order$/i,
    text: () => "Thưởng khi bạn được giới thiệu mua đơn đầu tiên",
  },
  {
    match: /^Reverse order cashback (proportionally )?after refund$/i,
    text: () => "Thu hồi eXU đã hoàn theo phần đơn được hoàn tiền",
  },
  {
    match: /^Reverse referral reward (proportionally )?after refund$/i,
    text: () => "Thu hồi thưởng giới thiệu theo phần đơn được hoàn tiền",
  },
  { match: /^Refund to eXu wallet$/i, text: () => "Hoàn tiền bằng điểm eXU" },
  { match: /^eXu expired after (\d+) days$/i, text: (m) => `eXU hết hạn sau ${m[1]} ngày` },
];

export function walletReasonText(reason: string, lang: string): string {
  if (lang !== "vi") return reason;
  for (const { match, text } of VI) {
    const m = reason.trim().match(match);
    if (m) return text(m);
  }
  return reason;
}
