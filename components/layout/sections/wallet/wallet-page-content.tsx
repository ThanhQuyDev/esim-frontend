"use client";

import { useState, useEffect } from "react";
import {
  Wallet,
  Clock,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  ShoppingBag,
  Gift,
  RotateCcw,
  ShieldBan,
  Coins,
  Trash2,
  Ticket,
  User,
  LogOut,
  Copy,
  Share2,
  Link2,
  MessageCircle,
  Pencil,
  Check,
  X,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import {
  useWalletMe,
  useWalletTransactions,
  useReferralProfile,
  useUpdateReferralCode,
  getTransactionLabel,
  type WalletTransaction,
} from "@/lib/hooks";
import { walletTranslations, type WalletDict } from "./translations";
import Link from "next/link";
import { localizedHref } from "@/lib/route-mapping";
import QRCode from "qrcode";

interface WalletPageContentProps {
  lang: "en" | "vi";
  embedded?: boolean;
}

type Tab = "wallet" | "referral";

function formatVnd(amount: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getExpiryColor(daysLeft: number | null): string {
  if (daysLeft === null) return "text-gray-400";
  if (daysLeft <= 0) return "text-gray-400";
  if (daysLeft <= 7) return "text-red-500";
  if (daysLeft <= 30) return "text-amber-500";
  return "text-emerald-500";
}

function getExpiryBgColor(daysLeft: number | null): string {
  if (daysLeft === null) return "bg-gray-100";
  if (daysLeft <= 0) return "bg-gray-100";
  if (daysLeft <= 7) return "bg-red-50";
  if (daysLeft <= 30) return "bg-amber-50";
  return "bg-emerald-50";
}

function getTxIcon(type: WalletTransaction["type"]) {
  const cls = "w-4 h-4";
  switch (type) {
    case "order_cashback":
      return <ShoppingBag className={cls} />;
    case "order_cashback_reversal":
      return <RotateCcw className={cls} />;
    case "referral_reward":
      return <Gift className={cls} />;
    case "referral_reward_reversal":
      return <RotateCcw className={cls} />;
    case "refund_to_wallet":
      return <ArrowDownRight className={cls} />;
    case "manual_credit":
      return <Coins className={cls} />;
    case "manual_debit":
      return <ArrowUpRight className={cls} />;
    case "manual_cancel":
      return <ShieldBan className={cls} />;
    case "redemption_capture":
      return <Ticket className={cls} />;
    case "redemption_release":
      return <RotateCcw className={cls} />;
    case "expiry_debit":
      return <Trash2 className={cls} />;
    default:
      return <Coins className={cls} />;
  }
}

function isCredit(type: WalletTransaction["type"]): boolean {
  return [
    "order_cashback",
    "referral_reward",
    "refund_to_wallet",
    "manual_credit",
    "redemption_release",
  ].includes(type);
}

export function WalletPageContent({ lang, embedded }: WalletPageContentProps) {
  const t = walletTranslations[lang];
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("wallet");

  if (!user) {
    if (embedded) return null;
    return (
      <main className="min-h-screen bg-gray-50 pt-24 pb-16">
        <div className="max-w-lg mx-auto px-4 text-center py-20">
          <Wallet className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">{t.signInRequired}</h2>
          <p className="text-gray-500 mb-4">{t.signInPrompt}</p>
          <Link
            href={`/${lang}`}
            className="inline-flex items-center px-6 py-2.5 bg-gray-900 text-white rounded-full text-base font-medium hover:bg-gray-800 transition-colors"
          >
            {t.goHome}
          </Link>
        </div>
      </main>
    );
  }

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: "wallet", label: t.tabWallet, icon: <Wallet className="w-4 h-4" /> },
    { key: "referral", label: t.tabReferral, icon: <Gift className="w-4 h-4" /> },
  ];

  const content = (
    <div className="space-y-6">
      {/* Sub-tabs */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-xl">
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
      {activeTab === "wallet" && <WalletTab t={t} lang={lang} />}
      {activeTab === "referral" && <ReferralTab t={t} lang={lang} />}
    </div>
  );

  if (embedded) return content;

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

        {content}
      </div>
    </main>
  );
}

function WalletTab({ t, lang }: { t: WalletDict; lang: string }) {
  const { data: wallet, isLoading, error, refetch } = useWalletMe();
  const {
    data: transactions,
    isLoading: txLoading,
    error: txError,
  } = useWalletTransactions();

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin h-8 w-8 border-4 border-gray-300 border-t-emerald-500 rounded-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
        <p className="text-gray-500 mb-4">{t.errorLoading}</p>
        <button
          onClick={() => refetch()}
          className="px-6 py-2 bg-gray-900 text-white rounded-full text-base font-medium hover:bg-gray-800"
        >
          {t.retry}
        </button>
      </div>
    );
  }

  if (!wallet) return null;

  const isLocked = wallet.status === "locked";
  const daysLeft = wallet.daysLeft;
  const expiryColor = getExpiryColor(daysLeft);
  const expiryBg = getExpiryBgColor(daysLeft);

  return (
    <div className="space-y-6">
      {/* Balance Card */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        {/* Gradient header */}
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-6 text-white">
          <div className="flex items-center gap-2 mb-1">
            <Wallet className="w-5 h-5 opacity-80" />
            <span className="text-base font-medium opacity-90">{t.balanceTitle}</span>
          </div>
          <p className="text-3xl font-medium tracking-tight">{formatVnd(wallet.balanceVnd)}</p>
          {wallet.availableBalanceVnd !== wallet.balanceVnd && (
            <p className="text-base mt-1 opacity-80">
              {t.availableBalance}: {formatVnd(wallet.availableBalanceVnd)}
            </p>
          )}
        </div>

        {/* Expiry info */}
        <div className="px-6 py-4 flex items-center justify-between">
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
              {daysLeft <= 7 ? "!" : ""}{daysLeft} {t.days}
            </span>
          )}
        </div>

        {/* Locked banner */}
        {isLocked && (
          <div className="mx-6 mb-4 flex items-start gap-3 rounded-xl bg-red-50 border border-red-100 p-4">
            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-base font-medium text-red-700">{t.walletLocked}</p>
              <p className="text-sm text-red-600 mt-1">{t.walletLockedDesc}</p>
            </div>
          </div>
        )}

        {/* Quick actions */}
        <div className="px-6 pb-4 flex gap-3">
          <Link
            href={localizedHref(lang, "cart")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-base font-medium transition-colors ${
              isLocked
                ? "bg-gray-100 text-gray-400 cursor-not-allowed pointer-events-none"
                : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            {t.useExu}
          </Link>
          <button
            onClick={() => {
              const el = document.querySelector('[data-tab="referral"]') as HTMLElement;
              el?.click();
            }}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-base font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
          >
            <Share2 className="w-4 h-4" />
            {t.shareReferral}
          </button>
        </div>
      </div>

      {/* Transaction History */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">{t.transactionHistory}</h2>
        </div>

        {txLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin h-6 w-6 border-3 border-gray-300 border-t-gray-600 rounded-full" />
          </div>
        ) : txError ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-base">{t.errorLoading}</p>
          </div>
        ) : !transactions || transactions.length === 0 ? (
          <div className="text-center py-12">
            <Coins className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400 text-base">{t.noTransactions}</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {transactions.map((tx) => {
              const credit = isCredit(tx.type);
              return (
                <div key={tx.id} className="px-6 py-4 flex items-center gap-4 hover:bg-gray-50/50 transition-colors">
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-xl flex-shrink-0 ${
                      credit ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"
                    }`}
                  >
                    {getTxIcon(tx.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-medium text-gray-900 truncate">
                      {getTransactionLabel(tx.type, lang)}
                    </p>
                    {tx.reason && (
                      <p className="text-sm text-gray-400 truncate">{tx.reason}</p>
                    )}
                    <p className="text-sm text-gray-400 mt-0.5">{formatDate(tx.createdAt)}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className={`text-base font-semibold ${credit ? "text-emerald-600" : "text-red-500"}`}>
                      {credit ? "+" : ""}{formatVnd(tx.amountVnd)}
                    </p>
                    <p className="text-sm text-gray-400">
                      {t.availableBalance}: {formatVnd(tx.balanceAfterVnd)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function ReferralTab({ t, lang }: { t: WalletDict; lang: string }) {
  const { data: referral, isLoading, error, refetch } = useReferralProfile();
  const updateReferral = useUpdateReferralCode();
  const [copied, setCopied] = useState<"code" | "link" | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editCode, setEditCode] = useState("");
  const [editError, setEditError] = useState("");
  const [editSuccess, setEditSuccess] = useState(false);

  const copyToClipboard = async (text: string, field: "code" | "link") => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(field);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      /* ignore */
    }
  };

  const validateCode = (code: string): boolean => {
    return /^[A-Z0-9]{10}$/.test(code);
  };

  const handleSaveCode = () => {
    const normalized = editCode.toUpperCase().trim();
    if (!validateCode(normalized)) {
      setEditError(t.editReferralValidation);
      return;
    }
    setEditError("");
    updateReferral.mutate(normalized, {
      onSuccess: () => {
        setIsEditing(false);
        setEditCode("");
        setEditSuccess(true);
        setTimeout(() => setEditSuccess(false), 3000);
      },
      onError: (err: Error) => {
        const msg = err.message || "";
        if (msg.toLowerCase().includes("duplicate") || msg.toLowerCase().includes("already") || msg.toLowerCase().includes("exists")) {
          setEditError(t.editReferralDuplicate);
        } else {
          setEditError(msg || t.editReferralDuplicate);
        }
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin h-8 w-8 border-4 border-gray-300 border-t-blue-500 rounded-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
        <p className="text-gray-500 mb-4">{t.errorLoading}</p>
        <button
          onClick={() => refetch()}
          className="px-6 py-2 bg-gray-900 text-white rounded-full text-base font-medium hover:bg-gray-800"
        >
          {t.retry}
        </button>
      </div>
    );
  }

  if (!referral) return null;

  const referralLink = `https://esim.vn/?ref=${referral.code}`;

  return (
    <div className="space-y-6">
      {/* Referral Code Card */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 text-white">
          <div className="flex items-center gap-2 mb-1">
            <Gift className="w-5 h-5 opacity-80" />
            <span className="text-base font-medium opacity-90">{t.referralTitle}</span>
          </div>
          <p className="text-3xl font-medium tracking-tight mt-2">{referral.code}</p>
        </div>

        {!referral.isActive && (
          <div className="mx-6 mt-4 flex items-start gap-3 rounded-xl bg-amber-50 border border-amber-100 p-4">
            <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-base text-amber-700">{t.referralInactive}</p>
          </div>
        )}

        <div className="p-6 space-y-4">
          {/* Success message */}
          {editSuccess && (
            <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-100 p-3">
              <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <p className="text-base text-emerald-700">{t.editReferralSuccess}</p>
            </div>
          )}

          {/* Copy Code + Edit */}
          {!isEditing ? (
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
                <p className="text-sm text-gray-400 mb-0.5">{t.referralCode}</p>
                <p className="text-base font-mono font-medium text-gray-900">{referral.code}</p>
              </div>
              <button
                onClick={() => copyToClipboard(referral.code, "code")}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-base font-medium hover:bg-blue-700 transition-colors flex-shrink-0"
              >
                {copied === "code" ? (
                  <>{t.copied}</>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    {t.copyCode}
                  </>
                )}
              </button>
              <button
                onClick={() => {
                  setIsEditing(true);
                  setEditCode(referral.code);
                  setEditError("");
                  setEditSuccess(false);
                }}
                className="flex items-center gap-1.5 px-3 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-base font-medium hover:bg-gray-200 transition-colors flex-shrink-0"
                title={t.editReferralCode}
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <p className="text-base font-medium text-gray-700 mb-1">{t.editReferralCode}</p>
                <p className="text-sm text-gray-500 mb-2">{t.editReferralCodeDesc}</p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={editCode}
                  onChange={(e) => {
                    const val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 10);
                    setEditCode(val);
                    setEditError("");
                  }}
                  placeholder={t.editReferralPlaceholder}
                  maxLength={10}
                  className={`flex-1 rounded-xl border px-4 py-2.5 text-base font-mono outline-none transition-colors ${
                    editError ? "border-red-400" : "border-border-primary focus:border-blue-400"
                  }`}
                />
                <button
                  onClick={handleSaveCode}
                  disabled={updateReferral.isPending || editCode.length !== 10}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-base font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex-shrink-0"
                >
                  {updateReferral.isPending ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Check className="w-3.5 h-3.5" />
                  )}
                  {t.editReferralSave}
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditCode("");
                    setEditError("");
                  }}
                  className="flex items-center gap-1.5 px-3 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-base font-medium hover:bg-gray-200 transition-colors flex-shrink-0"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span className={`text-sm ${editCode.length === 10 ? "text-emerald-600" : "text-gray-400"}`}>
                  {editCode.length}/10
                </span>
              </div>
              {editError && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 flex-shrink-0" />{editError}
                </p>
              )}
            </div>
          )}

          {/* Referral Link */}
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
              <p className="text-sm text-gray-400 mb-0.5">{t.referralLink}</p>
              <p className="text-base text-gray-600 truncate">{referralLink}</p>
            </div>
            <button
              onClick={() => copyToClipboard(referralLink, "link")}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-base font-medium hover:bg-gray-200 transition-colors flex-shrink-0"
            >
              {copied === "link" ? (
                t.copied
              ) : (
                <>
                  <Link2 className="w-3.5 h-3.5" />
                  {t.copyLink}
                </>
              )}
            </button>
          </div>

          {/* QR Code with logo */}
          <ReferralQrCode url={referralLink} />

          {/* Share buttons */}
          <div>
            <p className="text-sm text-gray-400 mb-2">{t.shareVia}</p>
            <div className="flex gap-2">
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-4 py-2 bg-[#1877F2] text-white rounded-xl text-base font-medium hover:opacity-90 transition-opacity"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                Facebook
              </a>
              <a
                href={`https://zalo.me/share?url=${encodeURIComponent(referralLink)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-4 py-2 bg-[#0068FF] text-white rounded-xl text-base font-medium hover:opacity-90 transition-opacity"
              >
                <MessageCircle className="w-4 h-4" />
                Zalo
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">{t.howItWorks}</h2>
          <p className="text-base text-gray-500 mt-1">{t.howItWorksDesc}</p>
        </div>
        <div className="p-6 space-y-6">
          {[
            { step: "1", title: t.howStep1, desc: t.howStep1Desc, icon: <Share2 className="w-5 h-5" /> },
            { step: "2", title: t.howStep2, desc: t.howStep2Desc, icon: <ShoppingBag className="w-5 h-5" /> },
            { step: "3", title: t.howStep3, desc: t.howStep3Desc, icon: <Gift className="w-5 h-5" /> },
          ].map((item) => (
            <div key={item.step} className="flex gap-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex-shrink-0">
                {item.icon}
              </div>
              <div>
                <p className="text-base font-semibold text-gray-900">{item.title}</p>
                <p className="text-base text-gray-500 mt-0.5">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ===== QR Code with Logo Overlay =====

function ReferralQrCode({ url }: { url: string }) {
  const [qrSrc, setQrSrc] = useState<string | null>(null);

  useEffect(() => {
    QRCode.toDataURL(url, {
      width: 200,
      margin: 2,
      errorCorrectionLevel: "H", // High error correction to allow logo overlay
      color: { dark: "#1e293b", light: "#ffffff" },
    })
      .then(setQrSrc)
      .catch(() => setQrSrc(null));
  }, [url]);

  if (!qrSrc) return null;

  return (
    <div className="flex flex-col items-center py-4">
      <div className="relative inline-block">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={qrSrc} alt="Referral QR Code" className="w-48 h-48 rounded-xl border border-gray-200" />
        {/* Logo overlay in center */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 rounded-xl bg-white shadow-md flex items-center justify-center border border-gray-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="Logo" className="w-9 h-9 object-contain" />
          </div>
        </div>
      </div>
      <p className="text-sm text-gray-400 mt-2 text-center">
        {url}
      </p>
    </div>
  );
}
