"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { useAuth } from "@/lib/auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";

/**
 * Landing pages for the links in account emails (#012, test round 4). The
 * reset-password email pointed at `/password-change`, a page that did not
 * exist, so every customer who asked for a new password hit an error page;
 * the two confirm-email links were in the same state.
 */
export type AccountLinkMode = "reset-password" | "confirm-email" | "confirm-new-email";

const TEXT = {
  vi: {
    "reset-password": { title: "Đặt lại mật khẩu", done: "Mật khẩu đã được đổi. Bạn có thể đăng nhập bằng mật khẩu mới." },
    "confirm-email": { title: "Xác nhận email", done: "Email đã được xác nhận. Bạn có thể đăng nhập ngay." },
    "confirm-new-email": { title: "Xác nhận email mới", done: "Email mới đã được xác nhận cho tài khoản của bạn." },
    newPassword: "Mật khẩu mới",
    repeat: "Nhập lại mật khẩu mới",
    submit: "Lưu mật khẩu mới",
    tooShort: "Mật khẩu cần ít nhất 6 ký tự.",
    mismatch: "Hai mật khẩu chưa khớp nhau.",
    expired: "Liên kết đã hết hạn hoặc không hợp lệ. Vui lòng yêu cầu gửi lại email.",
    failed: "Không thực hiện được. Liên kết có thể đã hết hạn hoặc đã được dùng.",
    working: "Đang xác nhận…",
    signIn: "Đăng nhập",
    home: "Về trang chủ",
  },
  en: {
    "reset-password": { title: "Reset your password", done: "Your password has been changed. You can sign in with the new one." },
    "confirm-email": { title: "Confirm your email", done: "Your email is confirmed. You can sign in now." },
    "confirm-new-email": { title: "Confirm your new email", done: "Your new email is confirmed for your account." },
    newPassword: "New password",
    repeat: "Repeat the new password",
    submit: "Save new password",
    tooShort: "The password needs at least 6 characters.",
    mismatch: "The two passwords do not match.",
    expired: "This link has expired or is not valid. Please ask for a new email.",
    failed: "That did not work. The link may have expired or been used already.",
    working: "Confirming…",
    signIn: "Sign in",
    home: "Go home",
  },
} as const;

const ENDPOINT: Record<AccountLinkMode, string> = {
  "reset-password": "/api/v1/auth/reset/password",
  "confirm-email": "/api/v1/auth/email/confirm",
  "confirm-new-email": "/api/v1/auth/email/confirm/new",
};

export function AccountLinkAction({ mode, lang }: { mode: AccountLinkMode; lang: "vi" | "en" }) {
  const t = TEXT[lang];
  const params = useSearchParams();
  const hash = params.get("hash") ?? "";
  const expires = Number(params.get("expires") ?? 0);
  const expired = !hash || (mode === "reset-password" && expires > 0 && expires < Date.now());
  const { openAuthModal } = useAuth();

  const [status, setStatus] = useState<"idle" | "working" | "done" | "error">("idle");
  const [error, setError] = useState("");
  const [password, setPassword] = useState("");
  const [repeat, setRepeat] = useState("");
  const confirmedOnce = useRef(false);

  async function call(body: Record<string, string>) {
    setStatus("working");
    setError("");
    try {
      const res = await fetch(`${API_BASE_URL}${ENDPOINT[mode]}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(String(res.status));
      setStatus("done");
    } catch {
      setStatus("error");
      setError(t.failed);
    }
  }

  // The confirm links act on their own; the reset link needs a new password.
  useEffect(() => {
    if (mode === "reset-password" || expired || confirmedOnce.current) return;
    confirmedOnce.current = true;
    void call({ hash });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, hash, expired]);

  function submit(e: FormEvent) {
    e.preventDefault();
    if (password.length < 6) return setError(t.tooShort);
    if (password !== repeat) return setError(t.mismatch);
    void call({ hash, password });
  }

  const homeHref = lang === "vi" ? "/" : "/en";

  return (
    <div className="mx-auto w-full max-w-md rounded-2xl border bg-white p-6 shadow-sm sm:p-8">
      <h1 className="mb-6 text-center text-2xl font-semibold text-gray-900">{t[mode].title}</h1>

      {expired ? (
        <p className="flex items-start gap-2 text-sm text-red-600" data-testid="account-link-expired">
          <XCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {t.expired}
        </p>
      ) : status === "done" ? (
        <div className="space-y-5 text-center" data-testid="account-link-done">
          <CheckCircle2 className="mx-auto h-10 w-10 text-green-600" />
          <p className="text-sm text-gray-700">{t[mode].done}</p>
          <div className="flex justify-center gap-3">
            {mode !== "confirm-new-email" && (
              <button
                type="button"
                onClick={openAuthModal}
                className="rounded-full bg-[#1a1a1a] px-5 py-2.5 text-sm font-medium text-white"
              >
                {t.signIn}
              </button>
            )}
            <Link href={homeHref} className="rounded-full border px-5 py-2.5 text-sm font-medium">
              {t.home}
            </Link>
          </div>
        </div>
      ) : mode === "reset-password" ? (
        <form onSubmit={submit} className="space-y-4" data-testid="reset-password-form">
          <label className="block space-y-1.5 text-sm">
            <span className="font-medium text-gray-700">{t.newPassword}</span>
            <input
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border px-3 py-2.5 text-base outline-none focus:border-[#1a1a1a] sm:text-sm"
            />
          </label>
          <label className="block space-y-1.5 text-sm">
            <span className="font-medium text-gray-700">{t.repeat}</span>
            <input
              type="password"
              autoComplete="new-password"
              value={repeat}
              onChange={(e) => setRepeat(e.target.value)}
              className="w-full rounded-lg border px-3 py-2.5 text-base outline-none focus:border-[#1a1a1a] sm:text-sm"
            />
          </label>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={status === "working"}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-[#1a1a1a] px-5 py-3 text-sm font-medium text-white disabled:opacity-60"
          >
            {status === "working" && <Loader2 className="h-4 w-4 animate-spin" />}
            {t.submit}
          </button>
        </form>
      ) : status === "error" ? (
        <p className="flex items-start gap-2 text-sm text-red-600">
          <XCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </p>
      ) : (
        <p className="flex items-center justify-center gap-2 text-sm text-gray-600">
          <Loader2 className="h-4 w-4 animate-spin" />
          {t.working}
        </p>
      )}
    </div>
  );
}
