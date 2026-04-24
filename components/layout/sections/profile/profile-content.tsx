"use client";

import { PersonalInfo } from "./personal-info";
import { EsimList } from "./esim-list";
import { profileTranslations } from "./translations";
import type { ProfileEsim } from "./esim-detail";

interface ProfileContentProps {
  lang: "en" | "vi";
}

// Mock eSIM data — replace with API hook when backend is ready
const MOCK_ESIMS: ProfileEsim[] = [
  {
    iccid: "8944110000000000001",
    matchingId: "M-2024-ABCDEF-001",
    smdpAddress: "smdp.example.com",
    activationCode: "LPA:1$smdp.example.com$M-2024-ABCDEF-001",
    planName: "Japan Travel 5GB",
    destination: "Japan",
    status: "active",
    dataGb: 5,
    dataUsedGb: 1.8,
    durationDays: 30,
    daysUsed: 12,
  },
  {
    iccid: "8944110000000000002",
    matchingId: "M-2024-GHIJKL-002",
    smdpAddress: "smdp.example.com",
    activationCode: "LPA:1$smdp.example.com$M-2024-GHIJKL-002",
    planName: "Thailand 3GB",
    destination: "Thailand",
    status: "active",
    dataGb: 3,
    dataUsedGb: 2.5,
    durationDays: 15,
    daysUsed: 10,
  },
  {
    iccid: "8944110000000000003",
    matchingId: "M-2024-MNOPQR-003",
    smdpAddress: "smdp.example.com",
    activationCode: "LPA:1$smdp.example.com$M-2024-MNOPQR-003",
    planName: "Korea 10GB",
    destination: "South Korea",
    status: "expired",
    dataGb: 10,
    dataUsedGb: 10,
    durationDays: 30,
    daysUsed: 30,
  },
  {
    iccid: "8944110000000000004",
    matchingId: "M-2024-STUVWX-004",
    smdpAddress: "smdp.example.com",
    activationCode: "LPA:1$smdp.example.com$M-2024-STUVWX-004",
    planName: "Vietnam 2GB",
    destination: "Vietnam",
    status: "pending",
    dataGb: 2,
    dataUsedGb: 0,
    durationDays: 7,
    daysUsed: 0,
  },
];

export function ProfileContent({ lang }: ProfileContentProps) {
  const t = profileTranslations[lang];

  return (
    <main className="min-h-screen bg-gray-50 pt-24 pb-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        {/* Page title */}
        <h1 className="text-2xl font-bold text-gray-900 mb-6">{t.pageTitle}</h1>

        {/* Personal info */}
        <div className="mb-6">
          <PersonalInfo t={t} />
        </div>

        {/* eSIM list */}
        <EsimList esims={MOCK_ESIMS} t={t} lang={lang} />
      </div>
    </main>
  );
}
