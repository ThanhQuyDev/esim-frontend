"use client";

import { useState } from "react";
import { User, Smartphone, Mail, LogOut, Wallet, Gift, Copy, Clock, ArrowRight } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useMyOrders, useMyEsims, useWalletMe, useReferralProfile } from "@/lib/hooks";
import { profileTranslations } from "./translations";
import { OrderList } from "./order-list";
import { EsimCardList } from "./esim-card-list";
import { PersonalInfo } from "./personal-info";
import { WalletPageContent } from "@/components/layout/sections/wallet/wallet-page-content";
import Link from "next/link";

interface ProfileContentProps {
  lang: "en" | "vi";
}

type Tab = "profile" | "sim" | "wallet";

function formatVnd(amount: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount);
}

function getExpiryColor(daysLeft: number | null): string {
  if (daysLeft === null) return "text-gray-400";
  if (daysLeft <= 0) return "text-gray-400";
  if (daysLeft <= 7) return "text-red-500";
  if (daysLeft <= 30) return "text-amber-500";
  return "text-emerald-500";
}

function getExpiryBg(daysLeft: number | null): string {
  if (daysLeft === null) return "bg-gray-100";
  if (daysLeft <= 0) return "bg-gray-100";
  if (daysLeft <= 7) return "bg-red-50";
  if (daysLeft <= 30) return "bg-amber-50";
  return "bg-emerald-50";
}

export function ProfileContent({ lang }: ProfileContentProps) {
  const t = profileTranslations[lang];
  const { user, logout } = useAuth();
  const { data: orders = [], isLoading: ordersLoading } = useMyOrders();
  const { data: esims = [], isLoading: esimsLoading } = useMyEsims();
  const { data: wallet } = useWalletMe();
  const { data: referral } = useReferralProfile();
  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const [referralCopied, setReferralCopied] = useState(false);

  const copyReferralCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setReferralCopied(true);
      setTimeout(() => setReferralCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  if (!user) {
    return (
      <main className="min-h-screen bg-gray-50 pt-24 pb-16">
        <div className="max-w-lg mx-auto px-4 text-center py-20">
          <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">
            {lang === "vi" ? "Vui lòng đăng nhập để xem hồ sơ." : "Please sign in to view your profile."}
          </p>
          <Link
            href={`/${lang}`}
            className="inline-flex items-center px-6 py-2.5 bg-gray-900 text-white rounded-full text-base font-medium hover:bg-gray-800 transition-colors"
          >
            {lang === "vi" ? "Về trang chủ" : "Go Home"}
          </Link>
        </div>
      </main>
    );
  }

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: "profile", label: t.tabProfile, icon: <User className="w-4 h-4" /> },
    { key: "wallet", label: t.tabWallet, icon: <Wallet className="w-4 h-4" /> },
    { key: "sim", label: t.tabSimManagement, icon: <Smartphone className="w-4 h-4" /> },
  ];

  const daysLeft = wallet?.daysLeft ?? null;
  const expiryColor = getExpiryColor(daysLeft);
  const expiryBg = getExpiryBg(daysLeft);

  return (
    <main className="min-h-screen bg-gray-50 pt-24 pb-16">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-[1.7rem] font-medium text-gray-900">{t.pageTitle}</h1>
          <button
            onClick={logout}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-base text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            {lang === "vi" ? "Đăng xuất" : "Sign Out"}
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-gray-100 rounded-xl mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-base font-medium rounded-lg transition-all ${
                activeTab === tab.key
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "profile" && (
          <div className="space-y-6">
            {/* Email Card */}
            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
              <div className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-medium shadow-md">
                    {user.email.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-base text-gray-500 mb-1">
                      <Mail className="w-3.5 h-3.5" />
                      {t.email}
                    </div>
                    <p className="text-xl font-medium text-gray-900 truncate">
                      {user.email}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Personal Info — moved out of SIM management tab */}
            <PersonalInfo t={t} lang={lang} />

            {/* eXU Wallet Balance Card */}
            {wallet && (
              <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-5 text-white">
                  <div className="flex items-center gap-2 mb-1">
                    <Wallet className="w-4 h-4 opacity-80" />
                    <span className="text-base font-medium opacity-90">{t.walletBalance}</span>
                  </div>
                  <p className="text-[1.7rem] font-medium tracking-tight">{formatVnd(wallet.balanceVnd)}</p>
                  {wallet.availableBalanceVnd !== wallet.balanceVnd && (
                    <p className="text-sm mt-1 opacity-80">
                      {t.availableBalance}: {formatVnd(wallet.availableBalanceVnd)}
                    </p>
                  )}
                </div>
                <div className="px-5 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    {daysLeft === null ? (
                      <span className="text-base text-gray-400">{t.noExpiry}</span>
                    ) : daysLeft <= 0 ? (
                      <span className="text-base text-gray-400">{t.expired}</span>
                    ) : (
                      <span className={`text-base font-medium ${expiryColor}`}>
                        {t.expiresIn} {daysLeft} {t.days}
                      </span>
                    )}
                  </div>
                  {daysLeft !== null && daysLeft > 0 && (
                    <span className={`text-sm px-2.5 py-1 rounded-full font-medium ${expiryBg} ${expiryColor}`}>
                      {daysLeft} {t.days}
                    </span>
                  )}
                </div>
                {wallet.status === "locked" && (
                  <div className="mx-5 mb-4 flex items-start gap-3 rounded-xl bg-red-50 border border-red-100 p-3">
                    <span className="text-base text-red-700">{t.walletLocked}</span>
                  </div>
                )}
                <div className="px-5 pb-4">
                  <button
                    onClick={() => setActiveTab("wallet")}
                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-base font-medium bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors cursor-pointer"
                  >
                    <Wallet className="w-4 h-4" />
                    {t.viewWallet}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Referral Code Card */}
            {referral && (
              <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-5 text-white">
                  <div className="flex items-center gap-2 mb-1">
                    <Gift className="w-4 h-4 opacity-80" />
                    <span className="text-base font-medium opacity-90">{t.referralCode}</span>
                  </div>
                  <p className="text-[1.7rem] font-medium tracking-tight font-mono">{referral.code}</p>
                </div>
                <div className="p-5 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
                      <p className="text-sm text-gray-400 mb-0.5">{t.referralLink}</p>
                      <p className="text-base text-gray-600 truncate">{`https://esim.vn/?ref=${referral.code}`}</p>
                    </div>
                    <button
                      onClick={() => copyReferralCode(referral.code)}
                      className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-base font-medium hover:bg-blue-700 transition-colors flex-shrink-0"
                    >
                      {referralCopied ? (
                        t.copied
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          {t.copyCode}
                        </>
                      )}
                    </button>
                  </div>
                  {!referral.isActive && (
                    <div className="flex items-start gap-2 rounded-xl bg-amber-50 border border-amber-100 p-3">
                      <span className="text-base text-amber-700">{t.referralInactive}</span>
                    </div>
                  )}
                  <button
                    onClick={() => setActiveTab("wallet")}
                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-base font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors cursor-pointer"
                  >
                    <Gift className="w-4 h-4" />
                    {t.shareReferral}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Order History */}
            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                <h2 className="text-xl font-semibold text-gray-900">{t.myOrders}</h2>
              </div>
              <div className="p-4">
                <OrderList
                  orders={orders}
                  isLoading={ordersLoading}
                  t={t}
                  lang={lang}
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === "wallet" && (
          <WalletPageContent lang={lang} embedded />
        )}

        {activeTab === "sim" && (
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <h2 className="text-xl font-semibold text-gray-900">{t.myEsims}</h2>
            </div>
            <div className="p-4">
              <EsimCardList
                esims={esims}
                isLoading={esimsLoading}
                t={t}
                lang={lang}
              />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
