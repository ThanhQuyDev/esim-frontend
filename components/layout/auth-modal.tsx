"use client";

import { useState, useRef, useEffect } from "react";
import { X, Mail, Loader2, ArrowLeft, Lock, ShieldCheck, Eye, EyeOff } from "lucide-react";
import { useAuth, AuthError, type AuthUser } from "@/lib/auth";
import { GoogleSignInButton } from "./google-signin-button";

type Step = "email" | "otp" | "set-password";
type Method = "otp" | "password";

interface AuthModalProps {
  lang?: string;
}

const t = (lang: string | undefined, vi: string, en: string) =>
  lang === "vi" ? vi : en;

const errorMessage = (lang: string | undefined, err: unknown, fallback: string) => {
  const code = err instanceof AuthError ? err.code : "";

  switch (code) {
    case "passwordNotSet":
      return t(
        lang,
        "Tài khoản này chưa đặt mật khẩu. Hãy đăng nhập bằng mã OTP, sau đó tạo mật khẩu.",
        "This account has no password yet. Sign in with an OTP code, then create one."
      );
    case "incorrectPassword":
      return t(lang, "Mật khẩu không đúng.", "Incorrect password.");
    case "notFound":
    case "emailNotExists":
      return t(lang, "Email này chưa được đăng ký.", "This email is not registered.");
    case "otpInvalid":
      return t(lang, "Mã OTP không đúng.", "Invalid OTP code.");
    case "otpExpired":
      return t(lang, "Mã OTP đã hết hạn. Vui lòng gửi lại.", "The OTP has expired. Please resend.");
    case "otpNotFound":
      return t(lang, "Không tìm thấy mã OTP. Vui lòng gửi lại.", "No OTP found. Please resend.");
    case "otpRecentlySent":
      return t(
        lang,
        "Mã vừa được gửi. Vui lòng đợi khoảng 1 phút trước khi gửi lại.",
        "A code was just sent. Please wait about a minute before resending."
      );
    case "otpMaxAttemptsExceeded":
      return t(
        lang,
        "Bạn đã nhập sai quá nhiều lần. Vui lòng gửi lại mã mới.",
        "Too many incorrect attempts. Please request a new code."
      );
    case "passwordAlreadySet":
      return t(lang, "Tài khoản này đã có mật khẩu.", "This account already has a password.");
    default:
      if (code.startsWith("needLoginViaProvider:")) {
        const provider = code.split(":")[1];
        return t(
          lang,
          `Tài khoản này đăng nhập bằng ${provider}. Vui lòng dùng ${provider} hoặc mã OTP.`,
          `This account uses ${provider}. Please sign in with ${provider} or an OTP code.`
        );
      }
      return (err instanceof Error && err.message) || fallback;
  }
};

export function AuthModal({ lang }: AuthModalProps) {
  const {
    authModalOpen,
    setAuthModalOpen,
    sendOtp,
    verifyOtp,
    loginWithPassword,
    loginWithGoogle,
    setPassword,
    forgotPassword,
  } = useAuth();
  const [step, setStep] = useState<Step>("email");
  const [method, setMethod] = useState<Method>("otp");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPasswordValue] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Focus first OTP input when switching to OTP step
  useEffect(() => {
    if (step === "otp") {
      otpRefs.current[0]?.focus();
    }
  }, [step]);

  const resetForm = () => {
    setEmail("");
    setPasswordValue("");
    setNewPassword("");
    setConfirmPassword("");
    setOtp(["", "", "", "", "", ""]);
    setShowPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    setError("");
    setNotice("");
    setMethod("otp");
    setStep("email");
  };

  const handleClose = () => {
    setAuthModalOpen(false);
    resetForm();
  };

  /** After any successful login: ask for a password if the account has none. */
  const afterLogin = (user: AuthUser) => {
    if (user.hasPassword === false) {
      setError("");
      setNotice("");
      setStep("set-password");
    } else {
      handleClose();
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setNotice("");
    setLoading(true);

    try {
      await sendOtp(email);
      setStep("otp");
    } catch (err) {
      setError(
        errorMessage(
          lang,
          err,
          t(lang, "Không thể gửi mã OTP. Vui lòng thử lại.", "Failed to send OTP. Please try again.")
        )
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setNotice("");
    setLoading(true);

    try {
      const user = await loginWithPassword(email, password);
      afterLogin(user);
    } catch (err) {
      setError(
        errorMessage(
          lang,
          err,
          t(lang, "Đăng nhập thất bại. Vui lòng thử lại.", "Login failed. Please try again.")
        )
      );
      // No password on this account — OTP is the only way in, so switch tabs.
      if (err instanceof AuthError && err.code === "passwordNotSet") {
        setMethod("otp");
        setPasswordValue("");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleCredential = async (idToken: string) => {
    setError("");
    setNotice("");
    setLoading(true);

    try {
      const user = await loginWithGoogle(idToken);
      afterLogin(user);
    } catch (err) {
      setError(
        errorMessage(
          lang,
          err,
          t(lang, "Đăng nhập Google thất bại.", "Google sign-in failed.")
        )
      );
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError(
        t(lang, "Vui lòng nhập email trước.", "Please enter your email first.")
      );
      return;
    }

    setError("");
    setNotice("");
    setLoading(true);

    try {
      await forgotPassword(email);
      setNotice(
        t(
          lang,
          "Đã gửi email đặt lại mật khẩu. Nếu không nhận được, hãy đăng nhập bằng mã OTP.",
          "A password reset email was sent. If it doesn't arrive, sign in with an OTP code."
        )
      );
    } catch (err) {
      setError(
        errorMessage(
          lang,
          err,
          t(lang, "Không thể gửi email đặt lại mật khẩu.", "Failed to send the reset email.")
        )
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (newPassword.length < 6) {
      setError(
        t(lang, "Mật khẩu phải có ít nhất 6 ký tự.", "Password must be at least 6 characters.")
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(t(lang, "Mật khẩu nhập lại không khớp.", "Passwords do not match."));
      return;
    }

    setLoading(true);

    try {
      await setPassword(newPassword);
      handleClose();
    } catch (err) {
      setError(
        errorMessage(
          lang,
          err,
          t(lang, "Không thể đặt mật khẩu. Vui lòng thử lại.", "Failed to set the password. Please try again.")
        )
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (otpCode: string) => {
    setError("");
    setLoading(true);

    try {
      const user = await verifyOtp(email, otpCode);
      afterLogin(user);
    } catch (err) {
      setError(
        errorMessage(
          lang,
          err,
          t(lang, "Mã OTP không hợp lệ. Vui lòng thử lại.", "Invalid OTP. Please try again.")
        )
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
    } catch (err) {
      setError(
        errorMessage(
          lang,
          err,
          t(lang, "Không thể gửi lại mã OTP.", "Failed to resend OTP.")
        )
      );
    } finally {
      setLoading(false);
    }
  };

  if (!authModalOpen) return null;

  const inputClass =
    "w-full rounded-xl border border-gray-200 pl-10 pr-4 py-3 text-base sm:text-sm outline-none transition-colors focus:border-[var(--bg-accent)] focus:ring-1 focus:ring-[var(--bg-accent)]";
  // Same as inputClass but leaves room on the right for the show/hide button.
  const passwordInputClass =
    "w-full rounded-xl border border-gray-200 pl-10 pr-11 py-3 text-base sm:text-sm outline-none transition-colors focus:border-[var(--bg-accent)] focus:ring-1 focus:ring-[var(--bg-accent)]";
  const submitClass =
    "w-full flex items-center justify-center gap-2 py-3 bg-[var(--bg-accent)] text-primary font-medium rounded-xl transition-colors hover:opacity-90 disabled:opacity-60 cursor-pointer";
  const tabClass = (active: boolean) =>
    `flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-base sm:text-sm font-medium transition-colors cursor-pointer ${
      active ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
    }`;

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
          /* ===== Step 1: Email + method choice ===== */
          <form
            onSubmit={method === "otp" ? handleSendOtp : handlePasswordLogin}
            className="p-8 space-y-5"
          >
            <div className="text-center">
              <div className="mx-auto w-14 h-14 rounded-full bg-[var(--bg-accent)]/10 flex items-center justify-center mb-4">
                {method === "otp" ? (
                  <Mail className="w-7 h-7 text-[var(--bg-accent)]" />
                ) : (
                  <Lock className="w-7 h-7 text-[var(--bg-accent)]" />
                )}
              </div>
              <h2 className="text-[1.7rem] sm:text-2xl font-medium text-gray-900">
                {t(lang, "Đăng nhập / Đăng ký", "Sign In / Sign Up")}
              </h2>
              <p className="mt-2 text-base sm:text-sm text-gray-500">
                {method === "otp"
                  ? t(
                      lang,
                      "Nhập email để nhận mã xác thực OTP",
                      "Enter your email to receive a verification code"
                    )
                  : t(
                      lang,
                      "Đăng nhập bằng email và mật khẩu",
                      "Sign in with your email and password"
                    )}
              </p>
            </div>

            {/* Method tabs */}
            <div className="flex gap-1 p-1 bg-gray-100 rounded-xl">
              <button
                type="button"
                onClick={() => {
                  setMethod("otp");
                  setError("");
                  setNotice("");
                }}
                className={tabClass(method === "otp")}
              >
                <ShieldCheck className="w-4 h-4" />
                {t(lang, "Mã OTP", "OTP code")}
              </button>
              <button
                type="button"
                onClick={() => {
                  setMethod("password");
                  setError("");
                  setNotice("");
                }}
                className={tabClass(method === "password")}
              >
                <Lock className="w-4 h-4" />
                {t(lang, "Mật khẩu", "Password")}
              </button>
            </div>

            {/* Error */}
            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-base sm:text-sm text-red-600">
                {error}
              </div>
            )}

            {/* Notice */}
            {notice && (
              <div className="p-3 rounded-xl bg-green-50 border border-green-200 text-base sm:text-sm text-green-700">
                {notice}
              </div>
            )}

            {/* Email input */}
            <div className="space-y-1.5">
              <label
                htmlFor="auth-email"
                className="text-base sm:text-sm font-medium text-gray-700"
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
                  className={inputClass}
                />
              </div>
            </div>

            {/* Password input */}
            {method === "password" && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="auth-password"
                    className="text-base sm:text-sm font-medium text-gray-700"
                  >
                    {t(lang, "Mật khẩu", "Password")}
                  </label>
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    disabled={loading}
                    className="text-sm text-secondary font-medium cursor-pointer disabled:opacity-60"
                  >
                    {t(lang, "Quên mật khẩu?", "Forgot password?")}
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    id="auth-password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPasswordValue(e.target.value)}
                    placeholder={t(lang, "Nhập mật khẩu", "Enter your password")}
                    className={passwordInputClass}
                  />
                  <PasswordToggle
                    lang={lang}
                    visible={showPassword}
                    onToggle={() => setShowPassword((v) => !v)}
                  />
                </div>
              </div>
            )}

            {/* Submit */}
            <button type="submit" disabled={loading} className={submitClass}>
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {method === "otp"
                ? t(lang, "Gửi mã OTP", "Send OTP")
                : t(lang, "Đăng nhập", "Sign in")}
            </button>

            {/* Google */}
            <GoogleDivider lang={lang} />
            <GoogleSignInButton
              locale={lang}
              disabled={loading}
              onCredential={handleGoogleCredential}
              onError={() =>
                setError(
                  t(
                    lang,
                    "Không thể kết nối tới Google. Vui lòng thử cách khác.",
                    "Couldn't reach Google. Please try another method."
                  )
                )
              }
            />
          </form>
        ) : step === "otp" ? (
          /* ===== Step 2: OTP Verification ===== */
          <div className="p-8 space-y-6">
            {/* Back button */}
            <button
              onClick={() => { setStep("email"); setError(""); setOtp(["", "", "", "", "", ""]); }}
              className="flex items-center gap-1 text-base sm:text-sm text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              {t(lang, "Quay lại", "Back")}
            </button>

            <div className="text-center">
              <h2 className="text-[1.7rem] font-medium sm:text-2xl text-gray-900">
                {t(lang, "Nhập mã OTP", "Enter OTP")}
              </h2>
              <p className="mt-2 text-base sm:text-sm text-gray-500">
                {t(lang, "Mã xác thực đã được gửi đến", "A verification code was sent to")}
                <br />
                <span className="font-medium text-gray-900">{email}</span>
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-base sm:text-sm text-red-600">
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
                  className="w-12 h-14 text-center text-2xl sm:text-xl font-medium rounded-xl border border-gray-200 outline-none transition-colors focus:border-[var(--bg-accent)] focus:ring-1 focus:ring-[var(--bg-accent)]"
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
            <p className="text-center text-base sm:text-sm text-gray-500">
              {t(lang, "Không nhận được mã?", "Didn't receive the code?")}{" "}
              <button
                type="button"
                onClick={handleResend}
                disabled={loading}
                className="text-secondary font-medium cursor-pointer disabled:opacity-60"
              >
                {t(lang, "Gửi lại", "Resend")}
              </button>
            </p>
          </div>
        ) : (
          /* ===== Step 3: Set a password for the account ===== */
          <form onSubmit={handleSetPassword} className="p-8 space-y-5">
            <div className="text-center">
              <div className="mx-auto w-14 h-14 rounded-full bg-[var(--bg-accent)]/10 flex items-center justify-center mb-4">
                <Lock className="w-7 h-7 text-[var(--bg-accent)]" />
              </div>
              <h2 className="text-[1.7rem] sm:text-2xl font-medium text-gray-900">
                {t(lang, "Tạo mật khẩu", "Create a password")}
              </h2>
              <p className="mt-2 text-base sm:text-sm text-gray-500">
                {t(
                  lang,
                  "Để bạn vẫn đăng nhập được khi không nhận được email OTP.",
                  "So you can still sign in when the OTP email doesn't arrive."
                )}
              </p>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-base sm:text-sm text-red-600">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label
                htmlFor="auth-new-password"
                className="text-base sm:text-sm font-medium text-gray-700"
              >
                {t(lang, "Mật khẩu mới", "New password")}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  id="auth-new-password"
                  type={showNewPassword ? "text" : "password"}
                  required
                  autoFocus
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder={t(lang, "Ít nhất 6 ký tự", "At least 6 characters")}
                  className={passwordInputClass}
                />
                <PasswordToggle
                  lang={lang}
                  visible={showNewPassword}
                  onToggle={() => setShowNewPassword((v) => !v)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="auth-confirm-password"
                className="text-base sm:text-sm font-medium text-gray-700"
              >
                {t(lang, "Nhập lại mật khẩu", "Confirm password")}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  id="auth-confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={t(lang, "Nhập lại mật khẩu", "Re-enter your password")}
                  className={passwordInputClass}
                />
                <PasswordToggle
                  lang={lang}
                  visible={showConfirmPassword}
                  onToggle={() => setShowConfirmPassword((v) => !v)}
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className={submitClass}>
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {t(lang, "Lưu mật khẩu", "Save password")}
            </button>

            <p className="text-center">
              <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                className="text-base sm:text-sm text-gray-500 hover:text-gray-700 cursor-pointer disabled:opacity-60"
              >
                {t(lang, "Để sau", "Maybe later")}
              </button>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}

function PasswordToggle({
  lang,
  visible,
  onToggle,
}: {
  lang?: string;
  visible: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      tabIndex={-1}
      aria-label={
        visible
          ? t(lang, "Ẩn mật khẩu", "Hide password")
          : t(lang, "Hiện mật khẩu", "Show password")
      }
      className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
    >
      {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
    </button>
  );
}

function GoogleDivider({ lang }: { lang?: string }) {
  if (!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) return null;

  return (
    <div className="relative">
      <div className="absolute inset-0 flex items-center">
        <span className="w-full border-t border-gray-200" />
      </div>
      <div className="relative flex justify-center">
        <span className="bg-white px-2 text-sm text-gray-400">
          {t(lang, "hoặc", "or")}
        </span>
      </div>
    </div>
  );
}
