"use client";

import { useState } from "react";
import { Loader2, Mail, Pencil, ShieldCheck } from "lucide-react";
import {
  useConfirmEmailChange,
  usePendingEmailChange,
  useRequestEmailChange,
} from "@/lib/hooks";

/** API error keys → what the customer should read. */
const MESSAGES: Record<string, { vi: string; en: string }> = {
  emailUnchanged: {
    vi: "Email này chính là email bạn đang dùng.",
    en: "That is already your current email.",
  },
  emailAlreadyExists: {
    vi: "Email này đã có tài khoản khác dùng.",
    en: "That email already belongs to another account.",
  },
  emailMismatch: {
    vi: "Mã xác nhận không thuộc email này. Hãy gửi lại mã.",
    en: "That code was not sent to this email. Request a new one.",
  },
  codeRecentlySent: {
    vi: "Mã vừa được gửi. Vui lòng đợi khoảng 1 phút rồi thử lại.",
    en: "A code was just sent. Please wait about a minute and try again.",
  },
  codeNotFound: {
    vi: "Chưa có yêu cầu đổi email nào. Hãy nhập email mới trước.",
    en: "No pending change. Enter the new email first.",
  },
  codeExpired: {
    vi: "Mã đã hết hạn. Hãy gửi lại mã mới.",
    en: "The code has expired. Request a new one.",
  },
  codeInvalid: {
    vi: "Mã xác nhận không đúng.",
    en: "That code is not correct.",
  },
  codeMaxAttemptsExceeded: {
    vi: "Bạn đã nhập sai quá nhiều lần. Hãy gửi lại mã mới.",
    en: "Too many wrong attempts. Request a new code.",
  },
};

function describe(error: string, lang: "en" | "vi"): string {
  const known = MESSAGES[error];
  if (known) return known[lang];
  return lang === "vi"
    ? "Không thực hiện được, vui lòng thử lại."
    : "That did not work, please try again.";
}

interface ChangeEmailProps {
  currentEmail: string;
  lang: "en" | "vi";
}

/**
 * Two-step email change (#057).
 *
 * The code goes to the NEW address and only a returned code moves the account:
 * signing in uses email + a one-time code, so switching to a mistyped address
 * without proving it first would lock the customer out of their own eSIMs.
 */
export function ChangeEmail({ currentEmail, lang }: ChangeEmailProps) {
  const vi = lang === "vi";
  const { data: pending } = usePendingEmailChange();
  const requestChange = useRequestEmailChange();
  const confirmChange = useConfirmEmailChange();

  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  // A change already awaiting its code survives a page reload.
  const awaiting = pending?.pendingEmail ?? null;
  const target = awaiting ?? (requestChange.isSuccess ? email : "");

  const submitEmail = (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    requestChange.mutate(email.trim(), {
      onError: (err: Error) => setError(describe(err.message, lang)),
    });
  };

  const submitCode = (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    confirmChange.mutate(
      { email: target, code: code.trim() },
      {
        onSuccess: () => {
          setDone(true);
          setOpen(false);
          setCode("");
          setEmail("");
        },
        onError: (err: Error) => setError(describe(err.message, lang)),
      }
    );
  };

  if (!open && !target) {
    return (
      <div className="flex items-center justify-between gap-3 border-t border-gray-100 px-6 py-3.5">
        <p className="text-sm text-gray-500">
          {done
            ? vi
              ? "Đã đổi email thành công."
              : "Your email has been changed."
            : vi
              ? "Đổi email đăng nhập của tài khoản này."
              : "Change the email you sign in with."}
        </p>
        <button
          type="button"
          onClick={() => {
            setOpen(true);
            setDone(false);
            setError("");
          }}
          data-testid="change-email-open"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 cursor-pointer"
        >
          <Pencil className="h-3.5 w-3.5" />
          {vi ? "Đổi email" : "Change email"}
        </button>
      </div>
    );
  }

  return (
    <div className="border-t border-gray-100 px-6 py-4" data-testid="change-email">
      {target ? (
        <form onSubmit={submitCode} className="space-y-3">
          <p className="flex items-start gap-2 text-sm text-gray-600">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
            <span>
              {vi
                ? "Đã gửi mã xác nhận 6 số tới "
                : "We sent a 6-digit code to "}
              <strong className="text-gray-900">{target}</strong>
              {vi
                ? ". Nhập mã để hoàn tất — email chỉ đổi sau khi bạn nhập đúng mã."
                : ". Enter it to finish — the email only changes once the code checks out."}
            </span>
          </p>
          <div className="flex flex-wrap gap-2">
            <input
              value={code}
              onChange={(event) =>
                setCode(event.target.value.replace(/\D/g, "").slice(0, 6))
              }
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="123456"
              data-testid="change-email-code"
              className="w-32 rounded-lg border border-gray-300 px-3 py-2 text-sm tracking-[0.3em] outline-none focus:border-gray-900"
            />
            <button
              type="submit"
              disabled={confirmChange.isPending || code.length !== 6}
              className="inline-flex items-center gap-1.5 rounded-lg bg-gray-900 px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-black disabled:opacity-50 cursor-pointer"
            >
              {confirmChange.isPending && (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              )}
              {vi ? "Xác nhận" : "Confirm"}
            </button>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                setCode("");
                setError("");
              }}
              className="rounded-lg px-3 py-2 text-sm text-gray-500 hover:text-gray-800 cursor-pointer"
            >
              {vi ? "Để sau" : "Later"}
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={submitEmail} className="space-y-3">
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <Mail className="h-3.5 w-3.5" />
            {vi ? "Email mới" : "New email"}
          </label>
          <div className="flex flex-wrap gap-2">
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              type="email"
              required
              placeholder={currentEmail}
              data-testid="change-email-input"
              className="min-w-0 flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900"
            />
            <button
              type="submit"
              disabled={requestChange.isPending || !email.trim()}
              className="inline-flex items-center gap-1.5 rounded-lg bg-gray-900 px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-black disabled:opacity-50 cursor-pointer"
            >
              {requestChange.isPending && (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              )}
              {vi ? "Gửi mã xác nhận" : "Send code"}
            </button>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                setError("");
              }}
              className="rounded-lg px-3 py-2 text-sm text-gray-500 hover:text-gray-800 cursor-pointer"
            >
              {vi ? "Huỷ" : "Cancel"}
            </button>
          </div>
        </form>
      )}

      {error && (
        <p
          data-testid="change-email-error"
          className="mt-2 text-sm font-medium text-red-600"
        >
          {error}
        </p>
      )}
    </div>
  );
}
