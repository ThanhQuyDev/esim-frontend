"use client";

import { useState, useEffect } from "react";
import { User, Phone, Save, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useMyProfile, useUpdateProfile } from "@/lib/hooks";
import { PHONE_MAX_LENGTH, sanitizePhoneInput } from "@/lib/utils";
import type { ProfileDict } from "./translations";

interface PersonalInfoProps {
  t: ProfileDict;
  lang: "en" | "vi";
}

/**
 * Form to update contact info (firstName, lastName, phoneNumber).
 * Persisted via PATCH /api/v1/auth/me.
 */
export function PersonalInfo({ t, lang }: PersonalInfoProps) {
  const { user } = useAuth();
  const { data: profile } = useMyProfile();
  const updateProfile = useUpdateProfile();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [error, setError] = useState("");

  // Hydrate from API response (or auth user as fallback)
  useEffect(() => {
    const source = profile || user;
    if (source) {
      setFirstName(source.firstName || "");
      setLastName(source.lastName || "");
      setPhone(sanitizePhoneInput(profile?.phoneNumber || user?.phoneNumber || ""));
    }
  }, [profile, user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    updateProfile.mutate(
      {
        firstName: firstName.trim() || undefined,
        lastName: lastName.trim() || undefined,
        phoneNumber: phone.trim() || null,
      },
      {
        onSuccess: () => setSavedAt(Date.now()),
        onError: (err: Error) => setError(err.message || "Failed to save"),
      }
    );
  };

  const justSaved = savedAt && Date.now() - savedAt < 2500;
  const saving = updateProfile.isPending;

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-gray-200 bg-white shadow-sm p-5"
    >
      <div className="flex items-start gap-3 mb-4">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-50 shrink-0">
          <User className="w-5 h-5 text-blue-500" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-xl sm:text-base sm:text-sm font-semibold text-gray-900">
            {t.personalInfo}
          </h3>
          <p className="text-sm text-gray-500 mt-0.5">
            {lang === "vi"
              ? "Cập nhật thông tin liên hệ để hỗ trợ tốt hơn."
              : "Keep your contact details up to date for faster support."}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <label className="block">
          <span className="text-sm font-medium text-gray-400 uppercase tracking-wider">
            {lang === "vi" ? "Họ" : "First name"}
          </span>
          <div className="relative mt-1">
            <User className="absolute top-1/2 left-3 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder={lang === "vi" ? "Nguyễn" : "John"}
              className="w-full pl-9 pr-3 py-2 text-base sm:text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-colors"
            />
          </div>
        </label>

        <label className="block">
          <span className="text-sm font-medium text-gray-400 uppercase tracking-wider">
            {lang === "vi" ? "Tên" : "Last name"}
          </span>
          <div className="relative mt-1">
            <User className="absolute top-1/2 left-3 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder={lang === "vi" ? "Văn A" : "Doe"}
              className="w-full pl-9 pr-3 py-2 text-base sm:text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-colors"
            />
          </div>
        </label>

        <label className="block sm:col-span-2">
          <span className="text-sm font-medium text-gray-400 uppercase tracking-wider">
            {t.phone}
          </span>
          <div className="relative mt-1">
            <Phone className="absolute top-1/2 left-3 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              type="tel"
              inputMode="tel"
              maxLength={PHONE_MAX_LENGTH}
              value={phone}
              onChange={(e) => setPhone(sanitizePhoneInput(e.target.value))}
              placeholder={lang === "vi" ? "0901234567" : "+15551234567"}
              className="w-full pl-9 pr-3 py-2 text-base sm:text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-colors"
            />
          </div>
        </label>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <p className="text-sm text-gray-400">
          {error ? (
            <span className="text-red-500">{error}</span>
          ) : justSaved ? (
            lang === "vi" ? "✓ Đã lưu thông tin" : "✓ Saved"
          ) : (
            lang === "vi"
              ? "Đồng bộ trên mọi thiết bị."
              : "Synced across all devices."
          )}
        </p>
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-60"
        >
          {saving ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Save className="w-3.5 h-3.5" />
          )}
          {t.saveChanges}
        </button>
      </div>
    </form>
  );
}
