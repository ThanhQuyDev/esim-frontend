"use client";

import { useState } from "react";
import { User, Mail, Phone, MapPin, Pencil, X, Check } from "lucide-react";
import type { ProfileDict } from "./translations";

interface PersonalInfoProps {
  t: ProfileDict;
}

interface UserInfo {
  fullName: string;
  email: string;
  phone: string;
  address: string;
}

// Mock user data (replace with API hook later)
const MOCK_USER: UserInfo = {
  fullName: "Nguyen Van A",
  email: "nguyenvana@email.com",
  phone: "+84 912 345 678",
  address: "123 Nguyen Hue, District 1, Ho Chi Minh City",
};

export function PersonalInfo({ t }: PersonalInfoProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [user, setUser] = useState<UserInfo>(MOCK_USER);
  const [draft, setDraft] = useState<UserInfo>(MOCK_USER);

  const handleSave = () => {
    setUser(draft);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setDraft(user);
    setIsEditing(false);
  };

  const fields: { key: keyof UserInfo; label: string; icon: React.ReactNode }[] = [
    { key: "fullName", label: t.fullName, icon: <User className="w-4 h-4 text-gray-400" /> },
    { key: "email", label: t.email, icon: <Mail className="w-4 h-4 text-gray-400" /> },
    { key: "phone", label: t.phone, icon: <Phone className="w-4 h-4 text-gray-400" /> },
    { key: "address", label: t.address, icon: <MapPin className="w-4 h-4 text-gray-400" /> },
  ];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-100">
            <User className="w-5 h-5 text-blue-600" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">{t.personalInfo}</h2>
        </div>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" />
            {t.editProfile}
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={handleCancel}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              {t.cancel}
            </button>
            <button
              onClick={handleSave}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              <Check className="w-3.5 h-3.5" />
              {t.saveChanges}
            </button>
          </div>
        )}
      </div>

      {/* Avatar + Fields */}
      <div className="p-6">
        {/* Avatar */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xl font-bold shadow-md">
            {user.fullName.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-lg font-semibold text-gray-900">{user.fullName}</p>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
        </div>

        {/* Fields */}
        <div className="space-y-4">
          {fields.map(({ key, label, icon }) => (
            <div key={key}>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-1.5">
                {icon}
                {label}
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={draft[key]}
                  onChange={(e) => setDraft({ ...draft, [key]: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                />
              ) : (
                <p className="text-sm text-gray-900 px-3 py-2 bg-gray-50 rounded-lg">
                  {user[key]}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
