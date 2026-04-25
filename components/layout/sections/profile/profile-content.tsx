"use client";

import { useState } from "react";
import { User, Smartphone, Mail, LogOut } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useMyOrders, useMyEsims } from "@/lib/hooks";
import { profileTranslations } from "./translations";
import { OrderList } from "./order-list";
import { EsimCardList } from "./esim-card-list";
import Link from "next/link";

interface ProfileContentProps {
  lang: "en" | "vi";
}

type Tab = "profile" | "sim";

export function ProfileContent({ lang }: ProfileContentProps) {
  const t = profileTranslations[lang];
  const { user, logout } = useAuth();
  const { data: orders = [], isLoading: ordersLoading } = useMyOrders();
  const { data: esims = [], isLoading: esimsLoading } = useMyEsims();
  const [activeTab, setActiveTab] = useState<Tab>("profile");

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
            className="inline-flex items-center px-6 py-2.5 bg-gray-900 text-white rounded-full text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            {lang === "vi" ? "Về trang chủ" : "Go Home"}
          </Link>
        </div>
      </main>
    );
  }

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: "profile", label: t.tabProfile, icon: <User className="w-4 h-4" /> },
    { key: "sim", label: t.tabSimManagement, icon: <Smartphone className="w-4 h-4" /> },
  ];

  return (
    <main className="min-h-screen bg-gray-50 pt-24 pb-16">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">{t.pageTitle}</h1>
          <button
            onClick={logout}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-all ${
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
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xl font-bold shadow-md">
                    {user.email.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                      <Mail className="w-3.5 h-3.5" />
                      {t.email}
                    </div>
                    <p className="text-base font-medium text-gray-900 truncate">
                      {user.email}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Order History */}
            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                <h2 className="text-base font-semibold text-gray-900">{t.myOrders}</h2>
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

        {activeTab === "sim" && (
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <h2 className="text-base font-semibold text-gray-900">{t.myEsims}</h2>
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
