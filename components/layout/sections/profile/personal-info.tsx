"use client";

import { useState, useEffect } from "react";
import { User, Phone, Save } from "lucide-react";
import { useAuth } from "@/lib/auth";
import type { ProfileDict } from "./translations";

interface PersonalInfoProps {
  t: ProfileDict;
  lang: "en" | "vi";
}

/**
 * Inline form to let a customer update contact info (full name + phone).
 *
 * Persists to localStorage as a lightweight client-side stash, since the
 * project does not yet expose a `PATCH /users/me` endpoint. When the
 * endpoint becomes available the submit handler can swap to a real API
 * call without changing the UI.
 *
 * Lives under the Profile tab (Hồ sơ) — moved out of the SIM management
 * tab so contact details sit alongside the rest of the user's profile.
 */
export function PersonalInfo({ t, lang }: PersonalInfoProps) {
  const { user } = useAuth();
  const storageKey = user ? `profile-contact-${user.id}` : null;

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  // Hydrate stored values once we know the user
  useEffect(() => {
    if (!storageKey) return;
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw) as { fullName?: string; phone?: string };
        if (parsed.fullName) setFullName(parsed.fullName);
        if (parsed.phone) setPhone(parsed.phone);
        return;
      }
    } catch {
      // ignore corrupted entries
    }
    // Fall back to the auth user's name when nothing is stored yet.
    const derivedName = [user?.firstName, user?.lastName]
      .filter(Boolean)
      .join(" ")
      .trim();
    if (derivedName) setFullName(derivedName);
  }, [storageKey, user?.firstName, user?.lastName]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!storageKey) return;
    setSaving(true);
    try {
      localStorage.setItem(
        storageKey,
        JSON.stringify({ fullName: fullName.trim(), phone: phone.trim() })
      );
      setSavedAt(Date.now());
    } finally {
      setSaving(false);
    }
  };

  const justSaved = savedAt && Date.now() - savedAt < 2500;

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
          <h3 className="text-base font-semibold text-gray-900">
            {t.personalInfo}
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            {lang === "vi"
              ? "Cập nhật thông tin liên hệ để hỗ trợ tốt hơn."
              : "Keep your contact details up to date for faster support."}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <label className="block">
          <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">
            {t.fullName}
          </span>
          <div className="relative mt-1">
            <User className="absolute top-1/2 left-3 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder={lang === "vi" ? "Nguyễn Văn A" : "John Doe"}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-colors"
            />
          </div>
        </label>

        <label className="block">
          <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">
            {t.phone}
          </span>
          <div className="relative mt-1">
            <Phone className="absolute top-1/2 left-3 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder={lang === "vi" ? "0901 234 567" : "+1 555 123 4567"}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-colors"
            />
          </div>
        </label>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <p className="text-[11px] text-gray-400">
          {justSaved
            ? lang === "vi"
              ? "✓ Đã lưu thông tin"
              : "✓ Saved"
            : lang === "vi"
              ? "Lưu cục bộ trên thiết bị này."
              : "Saved locally on this device."}
        </p>
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-900 text-white text-xs font-medium rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-60"
        >
          <Save className="w-3.5 h-3.5" />
          {t.saveChanges}
        </button>
      </div>
    </form>
  );
}
