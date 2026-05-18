interface BlogDisclaimerProps {
  lang?: string;
}

const disclaimerText: Record<string, string> = {
  vi: "Thông tin trên đây được kiểm tra và đảm bảo chính xác tại thời điểm đăng tải. Tuy nhiên, để an tâm hơn cho chuyến đi, bạn nên tham khảo thêm các nguồn chính thức và cập nhật thông báo địa phương trước và trong suốt hành trình nhé!",
  en: "The information above has been verified and is accurate at the time of publication. However, for extra peace of mind on your trip, we recommend checking official sources and local updates before and during your journey!",
};

export function BlogDisclaimer({ lang = "vi" }: BlogDisclaimerProps) {
  const text = disclaimerText[lang] || disclaimerText.en;

  return (
    <div className="mt-6 p-4 bg-neutral-50 border border-neutral-200 rounded-sm">
      <p className="body-sm text-secondary italic leading-relaxed">
        &ldquo;{text}&rdquo;
      </p>
    </div>
  );
}
