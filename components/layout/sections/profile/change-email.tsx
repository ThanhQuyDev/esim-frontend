"use client";

import { useState } from "react";
import { Loader2, Mail, Pencil, ShieldCheck } from "lucide-react";
import {
  useConfirmEmailChange,
  usePendingEmailChange,
  useRequestEmailChange,
  useVerifyCurrentEmailChange,
  type EmailChangeStage,
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
  currentEmailNotVerified: {
    vi: "Cần xác nhận email hiện tại trước.",
    en: "Please confirm your current email first.",
  },
  currentEmailAlreadyVerified: {
    vi: "Email hiện tại đã được xác nhận. Hãy nhập mã gửi tới email mới.",
    en: "Your current email is already confirmed. Enter the code sent to the new email.",
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
 * Email change in two confirmations (#057, #023).
 *
 * 1. A code goes to the CURRENT email — the account's own inbox has to agree.
 * 2. A second code goes to the NEW email — signing in uses email + a one-time
 *    code, so a mistyped address would lock the customer out of their eSIMs.
 *
 * Once confirmed, the signed-in user is updated in place, so the new email shows
 * immediately without logging in again.
 */
export function ChangeEmail({ currentEmail, lang }: ChangeEmailProps) {
  const vi = lang === "vi";
  const { data: pending } = usePendingEmailChange();
  const requestChange = useRequestEmailChange();
  const verifyCurrent = useVerifyCurrentEmailChange();
  const confirmChange = useConfirmEmailChange();

  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [doneEmail, setDoneEmail] = useState("");

  // A change already awaiting a code survives a page reload.
  const target =
    pending?.pendingEmail ?? (requestChange.isSuccess ? email.trim().toLowerCase() : "");
  const stage: EmailChangeStage | null =
    pending?.stage ?? (requestChange.isSuccess ? "current" : null);

  const resetForm = () => {
    setCode("");
    setError("");
  };

  const submitEmail = (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    requestChange.mutate(email.trim(), {
      onError: (err: Error) => setError(describe(err.message, lang)),
    });
  };

  const submitCurrentCode = (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    verifyCurrent.mutate(code.trim(), {
      onSuccess: () => setCode(""),
      onError: (err: Error) => setError(describe(err.message, lang)),
    });
  };

  const submitNewCode = (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    confirmChange.mutate(
      { email: target, code: code.trim() },
      {
        onSuccess: () => {
          setDoneEmail(target);
          setOpen(false);
          setCode("");
          setEmail("");
        },
        onError: (err: Error) => setError(describe(err.message, lang)),
      }
    );
  };

  /** Start over with a fresh code to the current email. */
  const restart = () => {
    setError("");
    if (!target) return;
    requestChange.mutate(target, {
      onSuccess: () => setCode(""),
      onError: (err: Error) => setError(describe(err.message, lang)),
    });
  };

  if (!open && !target) {
    return (
      <div className="flex items-center justify-between gap-3 border-t border-gray-100 px-6 py-3.5">
        <p className="text-sm text-gray-500" data-testid="change-email-status">
          {doneEmail
            ? vi
              ? `Đã đổi email thành công. Tài khoản đang dùng ${doneEmail}.`
              : `Your email has been changed. The account now uses ${doneEmail}.`
            : vi
              ? "Đổi email đăng nhập của tài khoản này."
              : "Change the email you sign in with."}
        </p>
        <button
          type="button"
          onClick={() => {
            setOpen(true);
            setDoneEmail("");
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

  const codeStep = target && stage;
  const isCurrentStep = stage === "current";
  const pendingCode = isCurrentStep ? verifyCurrent.isPending : confirmChange.isPending;

  return (
    <div className="border-t border-gray-100 px-6 py-4" data-testid="change-email">
      {codeStep ? (
        <form
          onSubmit={isCurrentStep ? submitCurrentCode : submitNewCode}
          className="space-y-3"
        >
          <p
            className="text-xs font-semibold uppercase tracking-wide text-gray-400"
            data-testid="change-email-step"
          >
            {isCurrentStep
              ? vi
                ? "Bước 1/2 · Xác nhận email hiện tại"
                : "Step 1 of 2 · Confirm your current email"
              : vi
                ? "Bước 2/2 · Xác nhận email mới"
                : "Step 2 of 2 · Confirm your new email"}
          </p>
          <p className="flex items-start gap-2 text-sm text-gray-600">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
            <span>
              {vi ? "Đã gửi mã xác nhận 6 số tới " : "We sent a 6-digit code to "}
              <strong className="text-gray-900">
                {isCurrentStep ? currentEmail : target}
              </strong>
              {isCurrentStep
                ? vi
                  ? ` (email hiện tại). Sau khi xác nhận, mã tiếp theo sẽ gửi tới ${target}.`
                  : ` (your current email). Once it checks out, the next code goes to ${target}.`
                : vi
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
              className="w-32 rounded-lg border border-gray-300 px-3 py-2 text-base sm:text-sm tracking-[0.3em] outline-none focus:border-gray-900"
            />
            <button
              type="submit"
              disabled={pendingCode || code.length !== 6}
              data-testid="change-email-submit-code"
              className="inline-flex items-center gap-1.5 rounded-lg bg-gray-900 px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-black disabled:opacity-50 cursor-pointer"
            >
              {pendingCode && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {isCurrentStep
                ? vi
                  ? "Xác nhận & tiếp tục"
                  : "Confirm & continue"
                : vi
                  ? "Xác nhận"
                  : "Confirm"}
            </button>
            <button
              type="button"
              onClick={restart}
              disabled={requestChange.isPending}
              className="rounded-lg px-3 py-2 text-sm text-gray-500 hover:text-gray-800 disabled:opacity-50 cursor-pointer"
            >
              {vi ? "Gửi lại mã" : "Resend code"}
            </button>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                resetForm();
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
          <p className="text-xs text-gray-500">
            {vi
              ? `Để bảo mật, mã xác nhận sẽ gửi tới email hiện tại (${currentEmail}) trước, rồi mới tới email mới.`
              : `For your security, a code goes to your current email (${currentEmail}) first, then to the new one.`}
          </p>
          <div className="flex flex-wrap gap-2">
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              type="email"
              required
              placeholder={currentEmail}
              data-testid="change-email-input"
              className="min-w-0 flex-1 rounded-lg border border-gray-300 px-3 py-2 text-base sm:text-sm outline-none focus:border-gray-900"
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
