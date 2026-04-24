"use client";

import { useState, useRef, useEffect } from "react";
import { X, Mail, Loader2, ArrowLeft } from "lucide-react";
import { useAuth } from "@/lib/auth";

type Step = "email" | "otp";

interface AuthModalProps {
  lang?: string;
}

const t = (lang: string | undefined, vi: string, en: string) =>
  lang === "vi" ? vi : en;

export function AuthModal({ lang }: AuthModalProps) {
  const { authModalOpen, setAuthModalOpen, sendOtp, verifyOtp } = useAuth();
  const [step, setStep] = useState<Step>("email");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Focus first OTP input when switching to OTP step
  useEffect(() => {
    if (step === "otp") {
      otpRefs.current[0]?.focus();
    }
  }, [step]);

  const resetForm = () => {
    setEmail("");
    setOtp(["", "", "", "", "", ""]);
    setError("");
    setStep("email");
  };

  const handleClose = () => {
    setAuthModalOpen(false);
    resetForm();
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await sendOtp(email);
      setStep("otp");
    } catch (err: any) {
      setError(
        err.message ||
          t(lang, "Không thể gửi mã OTP. Vui lòng thử lại.", "Failed to send OTP. Please try again.")
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (otpCode: string) => {
    setError("");
    setLoading(true);

    try {
      await verifyOtp(email, otpCode);
      handleClose();
    } catch (err: any) {
      setError(
        err.message ||
          t(lang, "Mã OTP không hợp lệ. Vui lòng thử lại.", "Invalid OTP. Please try again.")
      );
      setOtp(["", "", "", "", "", ""]);
      otpRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 6 digits entered
    const fullCode = newOtp.join("");
    if (fullCode.length === 6) {
      handleVerifyOtp(fullCode);
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 0) return;

    const newOtp = [...otp];
    for (let i = 0; i < 6; i++) {
      newOtp[i] = pasted[i] || "";
    }
    setOtp(newOtp);

    if (pasted.length === 6) {
      handleVerifyOtp(pasted);
    } else {
      otpRefs.current[pasted.length]?.focus();
    }
  };

  const handleResend = async () => {
    setError("");
    setLoading(true);
    try {
      await sendOtp(email);
      setError(""); // clear any previous error
    } catch (err: any) {
      setError(
        err.message ||
          t(lang, "Không thể gửi lại mã OTP.", "Failed to resend OTP.")
      );
    } finally {
      setLoading(false);
    }
  };

  if (!authModalOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md mx-4 bg-white rounded-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>

        {step === "email" ? (
          /* ===== Step 1: Email ===== */
          <form onSubmit={handleSendOtp} className="p-8 space-y-6">
            <div className="text-center">
              <div className="mx-auto w-14 h-14 rounded-full bg-[var(--bg-accent)]/10 flex items-center justify-center mb-4">
                <Mail className="w-7 h-7 text-[var(--bg-accent)]" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                {t(lang, "Đăng nhập / Đăng ký", "Sign In / Sign Up")}
              </h2>
              <p className="mt-2 text-sm text-gray-500">
                {t(
                  lang,
                  "Nhập email để nhận mã xác thực OTP",
                  "Enter your email to receive a verification code"
                )}
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* Email input */}
            <div className="space-y-1.5">
              <label
                htmlFor="auth-email"
                className="text-sm font-medium text-gray-700"
              >
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  id="auth-email"
                  type="email"
                  required
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-gray-200 pl-10 pr-4 py-3 text-sm outline-none transition-colors focus:border-[var(--bg-accent)] focus:ring-1 focus:ring-[var(--bg-accent)]"
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 bg-[var(--bg-accent)] text-white font-medium rounded-xl transition-colors hover:opacity-90 disabled:opacity-60 cursor-pointer"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {t(lang, "Gửi mã OTP", "Send OTP")}
            </button>
          </form>
        ) : (
          /* ===== Step 2: OTP Verification ===== */
          <div className="p-8 space-y-6">
            {/* Back button */}
            <button
              onClick={() => { setStep("email"); setError(""); setOtp(["", "", "", "", "", ""]); }}
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              {t(lang, "Quay lại", "Back")}
            </button>

            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900">
                {t(lang, "Nhập mã OTP", "Enter OTP")}
              </h2>
              <p className="mt-2 text-sm text-gray-500">
                {t(lang, "Mã xác thực đã được gửi đến", "A verification code was sent to")}
                <br />
                <span className="font-medium text-gray-900">{email}</span>
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* OTP inputs */}
            <div className="flex justify-center gap-3" onPaste={handleOtpPaste}>
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => { otpRefs.current[i] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(i, e)}
                  className="w-12 h-14 text-center text-xl font-bold rounded-xl border border-gray-200 outline-none transition-colors focus:border-[var(--bg-accent)] focus:ring-1 focus:ring-[var(--bg-accent)]"
                  aria-label={`OTP digit ${i + 1}`}
                />
              ))}
            </div>

            {/* Loading indicator */}
            {loading && (
              <div className="flex justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-[var(--bg-accent)]" />
              </div>
            )}

            {/* Resend */}
            <p className="text-center text-sm text-gray-500">
              {t(lang, "Không nhận được mã?", "Didn't receive the code?")}{" "}
              <button
                type="button"
                onClick={handleResend}
                disabled={loading}
                className="text-[var(--bg-accent)] font-medium hover:underline cursor-pointer disabled:opacity-60"
              >
                {t(lang, "Gửi lại", "Resend")}
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
