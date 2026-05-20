/**
 * Data + inline SVG illustrations for the eKYC registration guide page.
 *
 * The illustrations are stored as raw SVG strings (rendered via dangerouslySetInnerHTML)
 * to keep parity with the HTML reference one-to-one. Each region (HK / TW / HK+Macau)
 * pulls from the same set of steps but customizes notes, tips, and invalid docs.
 */

const F = "Google Sans,system-ui";

export const KYC_REGISTER_URL = "https://global.cmlink.com/en/real-name?LT=en";

/* ── Inline SVG illustrations — copied from HTML reference ── */

export const IL1 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 760 210"><rect width="760" height="210" fill="#EFF6FF"/><rect x="20" y="34" width="112" height="142" rx="14" fill="#DBEAFE"/><rect x="30" y="46" width="92" height="88" rx="8" fill="white"/><rect x="38" y="58" width="76" height="8" rx="4" fill="#93C5FD"/><rect x="38" y="71" width="60" height="6" rx="3" fill="#BFDBFE"/><rect x="38" y="81" width="66" height="6" rx="3" fill="#BFDBFE"/><rect x="38" y="91" width="46" height="6" rx="3" fill="#DBEAFE"/><rect x="50" y="108" width="52" height="20" rx="10" fill="#3B82F6"/><text x="76" y="122" text-anchor="middle" font-family="${F}" font-size="10" font-weight="700" fill="white">Đăng ký</text><line x1="142" y1="105" x2="162" y2="105" stroke="#93C5FD" stroke-width="2.2" stroke-dasharray="5,4" stroke-linecap="round"/><polygon points="170,105 159,99 159,111" fill="#93C5FD"/><rect x="178" y="18" width="564" height="174" rx="16" fill="white" stroke="#DBEAFE" stroke-width="1.5"/><rect x="178" y="18" width="564" height="40" rx="16" fill="#EFF6FF"/><rect x="178" y="38" width="564" height="20" fill="#EFF6FF"/><circle cx="204" cy="38" r="12" fill="#BFDBFE"/><circle cx="204" cy="38" r="7" fill="none" stroke="#3B82F6" stroke-width="1.5"/><line x1="204" y1="31" x2="204" y2="45" stroke="#3B82F6" stroke-width="1.2"/><line x1="197" y1="38" x2="211" y2="38" stroke="#3B82F6" stroke-width="1.2"/><text x="460" y="43" text-anchor="middle" font-family="${F}" font-size="13" font-weight="700" fill="#1E40AF" letter-spacing="0.2">Region for real name registration</text><rect x="192" y="66" width="536" height="33" rx="8" fill="#F9FAFB" stroke="#E5E7EB" stroke-width="1"/><circle cx="216" cy="82.5" r="8" fill="none" stroke="#D1D5DB" stroke-width="1.8"/><text x="238" y="87" font-family="${F}" font-size="13" fill="#374151">Hong Kong</text><rect x="192" y="106" width="536" height="33" rx="8" fill="#EFF6FF" stroke="#3B82F6" stroke-width="1.6"/><circle cx="216" cy="122.5" r="8" fill="#3B82F6"/><circle cx="216" cy="122.5" r="3" fill="white"/><text x="238" y="127" font-family="${F}" font-size="13" fill="#1E40AF" font-weight="700">Đài Loan (Taiwan)</text><rect x="608" y="113" width="100" height="20" rx="10" fill="#3B82F6"/><text x="658" y="127" text-anchor="middle" font-family="${F}" font-size="11" font-weight="700" fill="white">Đang chọn</text><rect x="192" y="146" width="536" height="33" rx="8" fill="#F9FAFB" stroke="#E5E7EB" stroke-width="1"/><circle cx="216" cy="162.5" r="8" fill="none" stroke="#D1D5DB" stroke-width="1.8"/><text x="238" y="167" font-family="${F}" font-size="13" fill="#374151">Hong Kong / Macau</text></svg>`;

export const IL2 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 760 200"><rect width="760" height="200" fill="#F5F3FF"/><rect x="180" y="30" width="120" height="140" rx="20" fill="#8B5CF6"/><rect x="192" y="50" width="96" height="96" rx="10" fill="#EDE9FE"/><rect x="200" y="62" width="80" height="18" rx="5" fill="white"/><rect x="204" y="67" width="36" height="6" rx="3" fill="#C4B5FD"/><rect x="200" y="86" width="80" height="18" rx="5" fill="white"/><rect x="204" y="91" width="24" height="6" rx="3" fill="#C4B5FD"/><rect x="214" y="112" width="52" height="20" rx="10" fill="#8B5CF6"/><text x="240" y="126" text-anchor="middle" font-family="${F}" font-size="10" font-weight="700" fill="white">Gửi</text><rect x="218" y="156" width="44" height="6" rx="3" fill="#7C3AED"/><path d="M310 100 Q380 60 450 80" fill="none" stroke="#C4B5FD" stroke-width="2" stroke-dasharray="6,4"/><path d="M450 80 Q520 50 560 90" fill="none" stroke="#C4B5FD" stroke-width="2" stroke-dasharray="6,4"/><rect x="440" y="60" width="72" height="52" rx="8" fill="white" stroke="#8B5CF6" stroke-width="2"/><polyline points="441,62 476,84 511,62" fill="none" stroke="#8B5CF6" stroke-width="2"/><rect x="548" y="74" width="56" height="40" rx="7" fill="#EDE9FE" stroke="#8B5CF6" stroke-width="1.5"/><polyline points="549,75 576,91 603,75" fill="none" stroke="#8B5CF6" stroke-width="1.5"/><circle cx="596" cy="72" r="12" fill="#10B981"/><polyline points="589,72 594,77 604,64" fill="none" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/><text x="380" y="170" text-anchor="middle" font-family="${F}" font-size="13" fill="#7C3AED" font-weight="600">Email hoặc SMS</text></svg>`;

export const IL3 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 760 200"><rect width="760" height="200" fill="#FFFBEB"/><path d="M120,28 L300,28 Q318,28 318,46 L318,172 Q318,186 304,186 L120,186 Q106,186 106,172 L106,80 Z" fill="#F59E0B"/><polygon points="106,80 150,28 106,28" fill="#D97706"/><rect x="158" y="52" width="108" height="88" rx="12" fill="#FEF3C7"/><rect x="168" y="62" width="26" height="22" rx="5" fill="#F59E0B" opacity=".55"/><rect x="200" y="62" width="26" height="22" rx="5" fill="#F59E0B" opacity=".55"/><rect x="232" y="62" width="26" height="22" rx="5" fill="#F59E0B" opacity=".55"/><rect x="168" y="90" width="26" height="22" rx="5" fill="#F59E0B" opacity=".55"/><rect x="200" y="90" width="26" height="22" rx="5" fill="#F59E0B" opacity=".55"/><rect x="232" y="90" width="26" height="22" rx="5" fill="#F59E0B" opacity=".55"/><rect x="168" y="118" width="26" height="14" rx="5" fill="#F59E0B" opacity=".55"/><rect x="200" y="118" width="26" height="14" rx="5" fill="#F59E0B" opacity=".55"/><rect x="232" y="118" width="26" height="14" rx="5" fill="#F59E0B" opacity=".55"/><text x="212" y="163" text-anchor="middle" font-family="${F}" font-size="12" font-weight="700" fill="white" letter-spacing="3">eSIM</text><line x1="326" y1="80" x2="384" y2="80" stroke="#F59E0B" stroke-width="2.2" stroke-dasharray="6,4" stroke-linecap="round"/><polygon points="393,80 381,74 381,86" fill="#F59E0B"/><rect x="404" y="52" width="310" height="56" rx="14" fill="white" stroke="#F59E0B" stroke-width="2.5"/><text x="426" y="74" font-family="${F}" font-size="11" fill="#D97706" font-weight="700" letter-spacing="1">ICCID</text><text x="426" y="98" font-family="${F}" font-size="20" font-weight="700" fill="#1C1917" letter-spacing="5">8984 5678 901</text><circle cx="436" cy="155" r="28" fill="none" stroke="#F59E0B" stroke-width="4"/><circle cx="436" cy="155" r="19" fill="#FEF3C7"/><text x="436" y="161" text-anchor="middle" font-family="${F}" font-size="13" font-weight="800" fill="#92400E">19–20</text><text x="478" y="151" font-family="${F}" font-size="13" fill="#92400E" font-weight="600">chữ số</text><text x="478" y="170" font-family="${F}" font-size="11" fill="#92400E">tìm trong email xác nhận</text></svg>`;

export const IL4A = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 220"><rect width="360" height="220" fill="#F0FDF4"/><rect x="16" y="29" width="328" height="52" rx="14" fill="#16A34A"/><rect x="34" y="43" width="32" height="24" rx="5" fill="white" opacity=".22"/><rect x="38" y="48" width="10" height="14" rx="2" fill="white" opacity=".6"/><rect x="50" y="51" width="12" height="3" rx="1.5" fill="white" opacity=".45"/><rect x="50" y="56" width="10" height="3" rx="1.5" fill="white" opacity=".45"/><text x="85" y="61" font-family="${F}" font-size="15" font-weight="700" fill="white">Passport</text><circle cx="316" cy="55" r="12" fill="white"/><polyline points="309,55 314,60 324,49" fill="none" stroke="#16A34A" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/><rect x="16" y="93" width="328" height="42" rx="12" fill="white" stroke="#BBF7D0" stroke-width="1.5"/><rect x="34" y="105" width="26" height="18" rx="4" fill="#DCFCE7"/><text x="74" y="119" font-family="${F}" font-size="13" fill="#6B7280">HK &amp; Macao Pass</text><rect x="16" y="147" width="328" height="42" rx="12" fill="white" stroke="#BBF7D0" stroke-width="1.5"/><rect x="34" y="159" width="26" height="18" rx="4" fill="#DCFCE7"/><text x="74" y="173" font-family="${F}" font-size="13" fill="#6B7280">HK Identity Card</text></svg>`;

export const IL4B = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 220"><rect width="360" height="220" fill="#F0FDF4"/><rect x="14" y="30" width="118" height="150" rx="14" fill="#DCFCE7" stroke="#16A34A" stroke-width="2"/><rect x="14" y="30" width="16" height="150" rx="14" fill="#16A34A" opacity=".28"/><rect x="30" y="48" width="44" height="44" rx="9" fill="#BBF7D0"/><circle cx="52" cy="62" r="10" fill="#16A34A" opacity=".36"/><rect x="32" y="78" width="40" height="7" rx="3.5" fill="#16A34A" opacity=".2"/><rect x="82" y="52" width="42" height="6" rx="3" fill="#86EFAC"/><rect x="82" y="62" width="34" height="6" rx="3" fill="#86EFAC"/><rect x="82" y="72" width="38" height="6" rx="3" fill="#86EFAC"/><rect x="30" y="144" width="92" height="22" rx="4" fill="#BBF7D0"/><line x1="142" y1="105" x2="160" y2="105" stroke="#16A34A" stroke-width="2" stroke-dasharray="5,4" stroke-linecap="round"/><polygon points="168,105 157,99 157,111" fill="#16A34A"/><rect x="178" y="38" width="166" height="108" rx="14" fill="white" stroke="#16A34A" stroke-width="2" stroke-dasharray="8,5"/><circle cx="261" cy="76" r="28" fill="#DCFCE7"/><line x1="261" y1="90" x2="261" y2="62" stroke="#16A34A" stroke-width="3" stroke-linecap="round"/><polyline points="249,74 261,62 273,74" fill="none" stroke="#16A34A" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><text x="261" y="130" text-anchor="middle" font-family="${F}" font-size="12" fill="#15803D" font-weight="600">Tải ảnh lên</text><rect x="178" y="160" width="70" height="22" rx="11" fill="#DCFCE7"/><text x="213" y="175" text-anchor="middle" font-family="${F}" font-size="10.5" fill="#15803D" font-weight="600">JPG/PNG</text><rect x="256" y="160" width="88" height="22" rx="11" fill="#DCFCE7"/><text x="300" y="175" text-anchor="middle" font-family="${F}" font-size="10.5" fill="#15803D" font-weight="600">Max 10MB</text></svg>`;

export const IL4C = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 220"><rect width="360" height="220" fill="#F0FDF4"/><rect x="14" y="30" width="118" height="150" rx="14" fill="#DCFCE7" stroke="#16A34A" stroke-width="2"/><rect x="14" y="30" width="16" height="150" rx="14" fill="#16A34A" opacity=".28"/><rect x="30" y="48" width="44" height="44" rx="9" fill="#BBF7D0"/><circle cx="52" cy="62" r="10" fill="#16A34A" opacity=".36"/><rect x="14" y="103" width="118" height="5" rx="2.5" fill="#16A34A" opacity=".45"/><rect x="30" y="144" width="92" height="22" rx="4" fill="#BBF7D0"/><line x1="142" y1="105" x2="158" y2="105" stroke="#16A34A" stroke-width="2" stroke-dasharray="5,4" stroke-linecap="round"/><polygon points="166,105 155,99 155,111" fill="#16A34A"/><rect x="176" y="36" width="170" height="34" rx="10" fill="white" stroke="#BBF7D0" stroke-width="1.5"/><rect x="188" y="46" width="34" height="6" rx="3" fill="#BBF7D0"/><rect x="228" y="46" width="50" height="6" rx="3" fill="#86EFAC"/><circle cx="328" cy="53" r="10" fill="#16A34A"/><polyline points="322,53 326,57 335,47" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><rect x="176" y="80" width="170" height="34" rx="10" fill="white" stroke="#BBF7D0" stroke-width="1.5"/><rect x="188" y="90" width="26" height="6" rx="3" fill="#BBF7D0"/><rect x="220" y="90" width="58" height="6" rx="3" fill="#86EFAC"/><circle cx="328" cy="97" r="10" fill="#16A34A"/><polyline points="322,97 326,101 335,91" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><rect x="176" y="124" width="170" height="34" rx="10" fill="white" stroke="#BBF7D0" stroke-width="1.5"/><rect x="188" y="134" width="42" height="6" rx="3" fill="#BBF7D0"/><rect x="236" y="134" width="38" height="6" rx="3" fill="#86EFAC"/><circle cx="328" cy="141" r="10" fill="#16A34A"/><polyline points="322,141 326,145 335,135" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><rect x="176" y="168" width="170" height="22" rx="11" fill="#16A34A"/><text x="261" y="183" text-anchor="middle" font-family="${F}" font-size="11" font-weight="700" fill="white">AI tự động điền</text></svg>`;

export const IL4D = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 220"><rect width="360" height="220" fill="#F0FDF4"/><rect x="54" y="26" width="9" height="9" rx="2" fill="#34D399" transform="rotate(15,58,30)"/><rect x="270" y="22" width="8" height="8" rx="2" fill="#F59E0B" transform="rotate(-15,274,26)"/><rect x="300" y="56" width="7" height="7" rx="2" fill="#EC4899" transform="rotate(25,303,59)"/><rect x="36" y="66" width="8" height="8" rx="2" fill="#8B5CF6" transform="rotate(-20,40,70)"/><circle cx="282" cy="40" r="5" fill="#60A5FA"/><circle cx="72" cy="52" r="4" fill="#F87171"/><circle cx="180" cy="108" r="70" fill="white" stroke="#16A34A" stroke-width="3"/><circle cx="180" cy="108" r="56" fill="#DCFCE7"/><polyline points="152,110 170,128 208,88" fill="none" stroke="#16A34A" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/><rect x="88" y="172" width="184" height="36" rx="18" fill="#16A34A"/><text x="180" y="195" text-anchor="middle" font-family="${F}" font-size="14" font-weight="700" fill="white">Confirm</text></svg>`;

/* ── Region & step data ── */

export type KycRegionKey = "hk" | "tw" | "hkmo";

export interface KycRegionData {
  key: KycRegionKey;
  flag: string;
  tabLabel: string;
  name: string;
  url: string;
  notes: string[];
  tips: string[];
  invalid: string[];
  done: string;
}

export interface KycStep {
  /** Step title (line 1) */
  t: string;
  /** HTML description (allows <b>) */
  d: string;
  /** Optional inline hint chip */
  h?: string;
  /** Hint variant: "warn" or "info" */
  hc?: "warn" | "info";
  /** Either a single illustration or a 2-column grid of illustrations */
  illustration:
    | { kind: "single"; svg: string; caption: string }
    | { kind: "grid"; items: Array<{ svg: string; caption: string }> };
}

export const KYC_STEPS: KycStep[] = [
  {
    t: "Chọn vùng đăng ký",
    d: 'Mở trang đăng ký → tìm mục <b>Region for real name registration</b> → chọn đúng vùng bạn sẽ dùng eSIM.',
    illustration: { kind: "single", svg: IL1, caption: 'Bước 1 · Chọn vùng, tích radio — nhãn "Đang chọn" xác nhận lựa chọn' },
  },
  {
    t: "Điền thông tin liên hệ",
    d: 'Nhập ít nhất <b>một phương thức liên hệ</b> (email hoặc số điện thoại) để nhận kết quả xác thực.',
    illustration: { kind: "single", svg: IL2, caption: "Bước 2 · Điền email hoặc số điện thoại" },
  },
  {
    t: "Nhập mã ICCID của eSIM",
    d: 'Nhập <b>ICCID</b> gồm 19–20 chữ số. Bấm <b>+ Add</b> để thêm nhiều eSIM cùng lúc.',
    h: "Tìm ICCID trong email xác nhận sau khi mua eSIM",
    hc: "info",
    illustration: { kind: "single", svg: IL3, caption: "Bước 3 · Nhập đủ 19–20 chữ số ICCID từ email xác nhận" },
  },
  {
    t: "Tải lên hộ chiếu & xác nhận",
    d: "Chọn loại giấy tờ → tích các ô đồng ý → upload ảnh hộ chiếu rõ nét. Hệ thống tự nhận dạng và điền thông tin tự động.",
    h: "Ảnh phải rõ nét, chụp toàn trang — không che khuất bất kỳ vùng nào",
    hc: "warn",
    illustration: {
      kind: "grid",
      items: [
        { svg: IL4A, caption: "4a · Chọn loại giấy tờ" },
        { svg: IL4B, caption: "4b · Upload ảnh hộ chiếu" },
        { svg: IL4C, caption: "4c · AI nhận dạng tự động" },
        { svg: IL4D, caption: "4d · Tích đồng ý & bấm Confirm" },
      ],
    },
  },
];

export const KYC_REGIONS: Record<KycRegionKey, KycRegionData> = {
  hk: {
    key: "hk",
    flag: "🇭🇰",
    tabLabel: "🇭🇰 Hong Kong",
    name: "Hong Kong",
    url: KYC_REGISTER_URL,
    notes: [
      "Theo chính sách HK, bạn phải hoàn tất đăng ký tên thật <b>trước khi</b> sử dụng eSIM.",
      "Bạn <b>không cần đăng ký</b> nếu không sử dụng eSIM tại Hồng Kông.",
      "Nếu thông tin không đáp ứng yêu cầu, đăng ký sẽ bị từ chối. Kết quả thông báo qua SMS/Email.",
      "Dữ liệu chỉ dùng cho mục đích đăng ký tên thật — hoàn toàn bảo mật.",
    ],
    tips: [
      "Dùng hộ chiếu gốc — không dùng bản photo hoặc ảnh chụp lại màn hình.",
      "Chụp đầy đủ trang thông tin, bao gồm cả mã vạch phía dưới.",
      "Tránh ánh sáng phản chiếu, bóng tối, hoặc vật che khuất.",
      "Đặt hộ chiếu trên mặt phẳng để tránh ảnh bị rung.",
      "Định dạng JPG/PNG, kích thước tối đa 10MB.",
    ],
    invalid: [
      "Hộ chiếu Đặc khu Hành chính HK (HK SAR Passport)",
      "Hộ chiếu Công dân Hải ngoại Anh (British National (Overseas) Passport)",
    ],
    done: "Sau khi hoàn tất, bạn sẽ nhận thông báo qua Email hoặc SMS. Hãy <b>khởi động lại điện thoại</b> và chờ khoảng <b>10 phút</b> để kết nối ổn định.",
  },
  tw: {
    key: "tw",
    flag: "🇹🇼",
    tabLabel: "🇹🇼 Đài Loan",
    name: "Đài Loan (Taiwan)",
    url: KYC_REGISTER_URL,
    notes: [
      "Theo chính sách Đài Loan, bạn phải hoàn tất đăng ký tên thật <b>trước khi</b> sử dụng eSIM.",
      "Bạn <b>không cần đăng ký</b> nếu không sử dụng eSIM tại Đài Loan.",
      "Nếu thông tin không đáp ứng yêu cầu, đăng ký sẽ bị từ chối. Kết quả thông báo qua SMS/Email.",
      "Dữ liệu chỉ dùng cho mục đích đăng ký tên thật — hoàn toàn bảo mật.",
    ],
    tips: [
      "Dùng hộ chiếu gốc — không dùng bản photo.",
      "Chụp đầy đủ trang thông tin kể cả mã vạch phía dưới.",
      "Tránh ánh sáng phản chiếu, bóng tối hoặc vật che.",
      "Đặt hộ chiếu trên mặt phẳng để tránh ảnh bị rung.",
      "Định dạng JPG/PNG, kích thước tối đa 10MB.",
    ],
    invalid: ["Hộ chiếu hết hạn", "Giấy tờ không phải hộ chiếu quốc tế"],
    done: "Sau khi hoàn tất, bạn sẽ nhận thông báo qua Email hoặc SMS. Hãy <b>khởi động lại điện thoại</b> và chờ khoảng <b>10 phút</b> để kết nối ổn định.",
  },
  hkmo: {
    key: "hkmo",
    flag: "🇭🇰🇲🇴",
    tabLabel: "🇭🇰🇲🇴 HK / Macau",
    name: "Hong Kong / Macau",
    url: KYC_REGISTER_URL,
    notes: [
      "Theo chính sách HK và Macau, bạn phải hoàn tất đăng ký tên thật <b>trước khi</b> sử dụng eSIM.",
      "Bạn <b>không cần đăng ký</b> nếu không sử dụng eSIM tại 2 vùng này.",
      "Nếu thông tin không đáp ứng yêu cầu, đăng ký sẽ bị từ chối. Kết quả thông báo qua SMS/Email.",
      "Dữ liệu chỉ dùng cho mục đích đăng ký tên thật — hoàn toàn bảo mật.",
    ],
    tips: [
      "Dùng hộ chiếu gốc — không dùng bản sao.",
      "Chụp toàn bộ trang thông tin bao gồm mã vạch.",
      "Tránh ánh sáng phản chiếu và bóng tối.",
      "Đặt hộ chiếu trên mặt phẳng để ảnh không bị rung.",
      "Định dạng JPG/PNG, kích thước tối đa 10MB.",
    ],
    invalid: [
      "Hộ chiếu Đặc khu Hành chính HK (HK SAR Passport)",
      "Hộ chiếu Công dân Hải ngoại Anh (British National (Overseas) Passport)",
      "Hộ chiếu hết hạn",
    ],
    done: "Sau khi hoàn tất, bạn sẽ nhận thông báo qua Email hoặc SMS. Hãy <b>khởi động lại điện thoại</b> và chờ khoảng <b>10 phút</b> để kết nối ổn định.",
  },
};
