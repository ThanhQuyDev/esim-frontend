"use client";

import { useState } from "react";
import { KeyRound, Loader2 } from "lucide-react";

import { PasswordInput } from "@/components/ui/password-input";
import { AuthError, useAuth } from "@/lib/auth";

/** API error codes → what the customer should read. */
const MESSAGES: Record<string, { vi: string; en: string }> = {
  incorrectOldPassword: {
    vi: "Mật khẩu hiện tại không đúng.",
    en: "Your current password is not correct.",
  },
  missingOldPassword: {
    vi: "Vui lòng nhập mật khẩu hiện tại.",
    en: "Please enter your current password.",
  },
  passwordAlreadySet: {
    vi: "Tài khoản đã có mật khẩu. Hãy tải lại trang rồi dùng mục Đổi mật khẩu.",
    en: "This account already has a password. Reload the page and use Change password.",
  },
};

const MIN_LENGTH = 6;

/**
 * "Mật khẩu" on the profile (vande #073). A customer who signed up with an
 * email code and pressed "Để sau" had no way back to creating a password,
 * and one who had a password could not change it here. Both are now one
 * row: "Tạo mật khẩu" without one, "Đổi mật khẩu" with one.
 */
export function PasswordSettings({ lang }: { lang: "en" | "vi" }) {
  const vi = lang === "vi";
  const { user, setPassword, changePassword, forgotPassword } = useAuth();
  const hasPassword = user?.hasPassword !== false;

  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [repeat, setRepeat] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState("");
  const [saving, setSaving] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const reset = () => {
    setCurrent("");
    setNext("");
    setRepeat("");
    setError("");
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    if (hasPassword && !current) {
      setError(
        vi
          ? "Vui lòng nhập mật khẩu hiện tại."
          : "Please enter your current password.",
      );
      return;
    }
    if (next.length < MIN_LENGTH) {
      setError(
        vi
          ? `Mật khẩu mới phải có ít nhất ${MIN_LENGTH} ký tự.`
          : `The new password needs at least ${MIN_LENGTH} characters.`,
      );
      return;
    }
    if (next !== repeat) {
      setError(
        vi ? "Mật khẩu nhập lại không khớp." : "The passwords do not match.",
      );
      return;
    }
    setSaving(true);
    try {
      if (hasPassword) {
        await changePassword(current, next);
        setDone(
          vi
            ? "Đã đổi mật khẩu. Các thiết bị khác đang đăng nhập tài khoản này đã được đăng xuất."
            : "Password changed. Other devices signed in to this account have been signed out.",
        );
      } else {
        await setPassword(next);
        setDone(
          vi
            ? "Đã tạo mật khẩu. Lần sau bạn có thể đăng nhập bằng email và mật khẩu, không cần chờ mã OTP."
            : "Password created. Next time you can sign in with your email and password, no code needed.",
        );
      }
      reset();
      setOpen(false);
    } catch (err) {
      const code = err instanceof AuthError ? err.code : "";
      setError(
        MESSAGES[code]?.[lang] ??
          (vi
            ? "Không lưu được mật khẩu, vui lòng thử lại."
            : "Could not save the password, please try again."),
      );
    } finally {
      setSaving(false);
    }
  };

  const sendReset = async () => {
    if (!user?.email) return;
    setError("");
    try {
      await forgotPassword(user.email);
      setResetSent(true);
    } catch {
      setError(
        vi
          ? "Không gửi được email, vui lòng thử lại."
          : "Could not send the email, please try again.",
      );
    }
  };

  if (!open) {
    return (
      <div
        className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 px-6 py-3.5"
        data-testid="password-settings"
      >
        <p
          className="min-w-0 flex-1 text-sm text-gray-500"
          data-testid="password-status"
        >
          {done ||
            (hasPassword
              ? vi
                ? "Mật khẩu: đã đặt. Bạn đăng nhập được bằng mật khẩu hoặc mã OTP."
                : "Password: set. You can sign in with it or with an email code."
              : vi
                ? "Mật khẩu: chưa có. Tạo mật khẩu để đăng nhập không cần chờ mã OTP."
                : "Password: not set. Create one to sign in without waiting for a code.")}
        </p>
        <button
          type="button"
          onClick={() => {
            setOpen(true);
            setDone("");
            setResetSent(false);
            reset();
          }}
          data-testid="password-open"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 cursor-pointer"
        >
          <KeyRound className="h-3.5 w-3.5" />
          {hasPassword
            ? vi
              ? "Đổi mật khẩu"
              : "Change password"
            : vi
              ? "Tạo mật khẩu"
              : "Create password"}
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="space-y-3 border-t border-gray-100 px-6 py-4"
      data-testid="password-form"
    >
      <p className="text-sm font-medium text-gray-900">
        {hasPassword
          ? vi
            ? "Đổi mật khẩu"
            : "Change password"
          : vi
            ? "Tạo mật khẩu"
            : "Create a password"}
      </p>

      {hasPassword && (
        <div className="space-y-1.5">
          <label htmlFor="pw-current" className="text-sm text-gray-700">
            {vi ? "Mật khẩu hiện tại" : "Current password"}
          </label>
          <PasswordInput
            id="pw-current"
            lang={lang}
            autoComplete="current-password"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            className="h-11 rounded-xl"
          />
          <button
            type="button"
            onClick={sendReset}
            className="text-xs text-gray-500 underline hover:text-gray-700 cursor-pointer"
          >
            {vi ? "Quên mật khẩu hiện tại?" : "Forgot your current password?"}
          </button>
          {resetSent && (
            <p className="text-xs text-emerald-700">
              {vi
                ? `Đã gửi email đặt lại mật khẩu tới ${user?.email}.`
                : `A reset email was sent to ${user?.email}.`}
            </p>
          )}
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor="pw-new" className="text-sm text-gray-700">
            {vi ? "Mật khẩu mới" : "New password"}
          </label>
          <PasswordInput
            id="pw-new"
            lang={lang}
            autoComplete="new-password"
            value={next}
            placeholder={
              vi
                ? `Ít nhất ${MIN_LENGTH} ký tự`
                : `At least ${MIN_LENGTH} characters`
            }
            onChange={(e) => setNext(e.target.value)}
            className="h-11 rounded-xl"
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="pw-repeat" className="text-sm text-gray-700">
            {vi ? "Nhập lại mật khẩu mới" : "Repeat the new password"}
          </label>
          <PasswordInput
            id="pw-repeat"
            lang={lang}
            autoComplete="new-password"
            value={repeat}
            onChange={(e) => setRepeat(e.target.value)}
            className="h-11 rounded-xl"
          />
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-600" data-testid="password-error">
          {error}
        </p>
      )}

      <div className="flex flex-wrap justify-end gap-2">
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            reset();
          }}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
        >
          {vi ? "Hủy" : "Cancel"}
        </button>
        <button
          type="submit"
          disabled={saving}
          data-testid="password-save"
          className="inline-flex items-center gap-2 rounded-lg bg-[#1a1a1a] px-4 py-2 text-sm font-medium text-white disabled:opacity-60 cursor-pointer"
        >
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          {hasPassword
            ? vi
              ? "Đổi mật khẩu"
              : "Change password"
            : vi
              ? "Lưu mật khẩu"
              : "Save password"}
        </button>
      </div>
    </form>
  );
}
