// Localized category labels for Help Center
const CATEGORY_LABELS: Record<string, Record<string, string>> = {
  getting_started: { en: "Getting Started", vi: "Bắt đầu" },
  plans_and_payments: { en: "Plans & Payments", vi: "Gói cước & Thanh toán" },
  troubleshooting: { en: "Troubleshooting", vi: "Khắc phục sự cố" },
  faq: { en: "FAQ", vi: "Câu hỏi thường gặp" },
};

export function getCategoryLabel(key: string, lang = "en"): string {
  const labels = CATEGORY_LABELS[key];
  if (labels) return labels[lang] || labels.en || key;
  return key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function formatParent(parent: string, lang = "en"): string {
  // Could be extended with a lookup table for parent labels
  return parent.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
