import { FooterSection } from "@/components/layout/sections/footer";
import { DevicePage, type PageFaq } from "@/components/layout/sections/supported-devices/design/device-page";
import { getFaqs, getSupportedDevices } from "@/lib/api";
import { getCmsSeoUrlForPage } from "@/lib/cms-seo-url";
import { getDictionary } from "@/lib/dictionaries";
import { faqCandidateUrls } from "@/lib/faq-urls";
import { buildFaqSchema } from "@/lib/faq-schema";
import { getSeoMetadata } from "@/lib/seo";
import { getLocale } from "next-intl/server";
import type { Locale } from "@/lib/i18n-config";

export async function generateMetadata() {
  const locale = (await getLocale()) as Locale;
  const dict = await getDictionary(locale);
  return getSeoMetadata(
    getCmsSeoUrlForPage("/esim-supported-devices", locale),
    {
      title: dict.metadata.title,
      description: dict.metadata.description,
    }
  );
}

/** The spec's six questions, until the CMS holds the page's own (vande-2011 #031, section 7). */
const SPEC_FAQ: Record<"vi" | "en", PageFaq[]> = {
  vi: [
    { question: "Thiết bị nào tương thích với eSIM?", answer: "Thiết bị cần có chip eSIM, đã mở khóa nhà mạng và dùng phiên bản hệ điều hành mới. Phần lớn iPhone từ XS/XR trở lên, Google Pixel từ đời 3, Samsung Galaxy từ S20 trở lên và nhiều máy tính bảng, đồng hồ có kết nối di động đều hỗ trợ." },
    { question: "Làm sao biết thiết bị của tôi có hỗ trợ eSIM?", answer: "Cách nhanh nhất là bấm *#06# trên bàn phím gọi: nếu hiện dãy số EID thì máy có eSIM. Trên iPhone, vào Cài đặt › Di động và tìm mục “Thêm eSIM”. Trên Android, vào Cài đặt › Mạng và internet › SIM và tìm mục “Thêm SIM” hoặc “Tải SIM”." },
    { question: "iPhone của tôi có hỗ trợ eSIM không?", answer: "iPhone XS, XR và các đời sau đều có eSIM. Riêng iPhone bán tại Trung Quốc đại lục dùng hai SIM vật lý nên không có eSIM; một số đời bán tại Hồng Kông và Ma Cao cũng bị hạn chế. Hãy kiểm tra theo cách ở câu trên nếu bạn không chắc." },
    { question: "Mọi thiết bị đều hỗ trợ eSIM sao?", answer: "Không. Máy đời cũ, một số dòng giá rẻ và máy đã bị khóa mạng thường không dùng được eSIM. Máy đã root hoặc jailbreak cũng có thể không cài được." },
    { question: "Tôi có dùng eSIM cùng lúc với SIM vật lý được không?", answer: "Được, nếu máy hỗ trợ hai SIM. Bạn giữ SIM vật lý để nhận cuộc gọi, tin nhắn và đặt eSIM du lịch làm đường dữ liệu di động." },
    { question: "eSIM có bị gắn chặt với một chiếc điện thoại không?", answer: "Có. Sau khi cài đặt, eSIM gắn với thiết bị đó và thường không chuyển sang máy khác được. Hãy cài eSIM trên đúng chiếc máy bạn sẽ mang đi du lịch." },
  ],
  en: [
    { question: "Which devices are eSIM compatible?", answer: "A device needs an eSIM chip, must be carrier-unlocked and run a recent OS. Most iPhones from XS/XR on, Google Pixel from the 3, Samsung Galaxy from the S20 on and many tablets and watches with a mobile connection support it." },
    { question: "How do I know if my device supports eSIM?", answer: "The quickest way is to dial *#06#: if an EID shows, the device has an eSIM. On an iPhone, go to Settings › Cellular and look for “Add eSIM”. On Android, go to Settings › Network & internet › SIMs and look for “Add SIM” or “Download SIM”." },
    { question: "Does my iPhone support eSIM?", answer: "The iPhone XS, XR and later all have an eSIM. iPhones sold in mainland China use two physical SIMs and have no eSIM; some models sold in Hong Kong and Macao are limited too. Check as above if you are not sure." },
    { question: "Do all devices support eSIM?", answer: "No. Older devices, some budget models and carrier-locked devices usually cannot use an eSIM. A rooted or jailbroken device may not install one either." },
    { question: "Can I use an eSIM alongside my physical SIM?", answer: "Yes, if the device supports two SIMs. Keep your physical SIM for calls and texts, and set the travel eSIM as your mobile data line." },
    { question: "Is an eSIM tied to one phone?", answer: "Yes. Once installed, the eSIM belongs to that device and usually cannot move to another. Install it on the phone you will take on the trip." },
  ],
};

export default async function SupportedDevicesPage() {
  const locale = (await getLocale()) as Locale;
  const lang = locale === "en" ? "en" : "vi";
  const dict = await getDictionary(locale);
  const devicesData = await getSupportedDevices(undefined, locale);

  // The same FAQs as the FAQ block and the page schema read (vande-2011 #046).
  const path = lang === "vi" ? "/thiet-bi-ho-tro-esim" : "/en/esim-supported-devices";
  const faqRows = await getFaqs({ lang: locale, urls: faqCandidateUrls({ pathname: path, locale }) })
    .then((r) => r.data)
    .catch(() => []);
  const schema = buildFaqSchema(faqRows) as {
    mainEntity?: { name: string; acceptedAnswer: { text: string } }[];
  } | null;
  const cmsFaqs = (schema?.mainEntity ?? []).map((q) => ({ question: q.name, answer: q.acceptedAnswer.text }));

  return (
    <main role="main">
      <DevicePage
        groups={devicesData.data as never}
        faqs={cmsFaqs.length ? cmsFaqs : SPEC_FAQ[lang]}
        lang={lang}
        apiBase={process.env.NEXT_PUBLIC_API_BASE_URL || ""}
      />
      <FooterSection dict={dict.footer} lang={locale} />
    </main>
  );
}
