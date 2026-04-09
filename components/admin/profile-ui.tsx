"use client";

import { useState, useTransition } from "react";
import {
  User,
  Mail,
  Shield,
  Clock,
  Eye,
  EyeOff,
  CheckCircle,
  X,
  AlertCircle,
} from "lucide-react";
import { updateProfile, changePassword } from "@/app/admin/profile/actions";
import type { AdminProfile } from "@/lib/admin-api";

// ── Helpers ───────────────────────────────────────────────────────────────────

const ROLE_LABELS: Record<string, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
  editor: "Editor",
  order_manager: "Orders",
};

const ROLE_COLORS: Record<string, string> = {
  super_admin: "bg-purple-100 text-purple-700",
  admin: "bg-blue-100 text-blue-700",
  editor: "bg-emerald-100 text-emerald-700",
  order_manager: "bg-amber-100 text-amber-700",
};

function formatLastLogin(dt: string | null): string {
  if (!dt) return "First login";
  try {
    return new Intl.DateTimeFormat("en-GB", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(dt));
  } catch {
    return dt;
  }
}

const inputCls =
  "h-10 w-full rounded-xl border border-black/[0.09] bg-white px-3.5 text-[0.875rem] text-[#1a1a1a] outline-none placeholder:text-[#aaa] transition focus:border-[#E85C1A] focus:ring-2 focus:ring-[#E85C1A]/10";

// ── Sub-components ────────────────────────────────────────────────────────────

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#f0f2f5] text-[#5c5e62]">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.1em] text-[#aaa]">
          {label}
        </p>
        <div className="mt-0.5 text-[0.875rem] font-medium text-[#1a1a1a]">{value}</div>
      </div>
    </div>
  );
}

function PasswordField({
  label,
  value,
  onChange,
  show,
  onToggle,
  placeholder,
  fieldError,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  show: boolean;
  onToggle: () => void;
  placeholder?: string;
  fieldError?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-[0.78rem] font-bold uppercase tracking-[0.1em] text-[#5c5e62]">
        {label}
      </label>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          className={`${inputCls} pr-10 ${
            fieldError ? "border-red-300 focus:border-red-400 focus:ring-red-100" : ""
          }`}
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#aaa] transition hover:text-[#5c5e62]"
        >
          {show ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      </div>
      {fieldError && (
        <p className="mt-1 text-[0.78rem] text-red-500">{fieldError}</p>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function ProfileUI({
  profile,
  firstLogin,
}: {
  profile: AdminProfile;
  firstLogin: boolean;
}) {
  // ── Profile edit state ──────────────────────────────────────────────────────
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [, startProfileTransition] = useTransition();

  // ── Password state ──────────────────────────────────────────────────────────
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordFieldError, setPasswordFieldError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [, startPasswordTransition] = useTransition();

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleProfileSave = () => {
    if (!name.trim() || !email.trim()) return;
    setProfileError(null);
    setSavingProfile(true);
    startProfileTransition(async () => {
      const res = await updateProfile(name.trim(), email.trim());
      setSavingProfile(false);
      if (res.error) {
        setProfileError(res.error);
      } else {
        setProfileSuccess(true);
        setEditing(false);
        setTimeout(() => setProfileSuccess(false), 4000);
      }
    });
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordFieldError(null);
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters.");
      return;
    }
    setSavingPassword(true);
    startPasswordTransition(async () => {
      const res = await changePassword(currentPassword, newPassword, confirmPassword);
      setSavingPassword(false);
      if (res.fieldError) {
        setPasswordFieldError(res.fieldError);
      } else if (res.error) {
        setPasswordError(res.error);
      } else {
        setPasswordSuccess(true);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setTimeout(() => setPasswordSuccess(false), 7000);
      }
    });
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="p-6 md:p-8">
      <div className="max-w-xl space-y-6">

        {/* First-login banner */}
        {firstLogin && !passwordSuccess && (
          <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3.5 text-[0.875rem] text-amber-800">
            <AlertCircle size={16} className="mt-0.5 shrink-0 text-amber-500" />
            <div>
              <p className="font-semibold">Welcome! Please change your password.</p>
              <p className="mt-0.5 text-[0.82rem]">
                You&apos;re using a temporary password. Set a permanent one before continuing.
              </p>
            </div>
          </div>
        )}

        {/* ── Profile card ── */}
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <p className="text-[0.7rem] font-bold uppercase tracking-[0.15em] text-[#5c5e62]">
              Profile
            </p>
            {!editing && (
              <button
                type="button"
                onClick={() => { setEditing(true); setProfileError(null); }}
                className="text-[0.8rem] font-semibold text-[#E85C1A] transition hover:underline"
              >
                Edit
              </button>
            )}
          </div>

          {profileSuccess && (
            <div className="mb-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-[0.83rem] text-emerald-700">
              <CheckCircle size={14} className="shrink-0" />
              Profile updated successfully.
            </div>
          )}
          {profileError && (
            <div className="mb-4 flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-[0.83rem] text-red-700">
              <span>{profileError}</span>
              <button type="button" onClick={() => setProfileError(null)}>
                <X size={13} />
              </button>
            </div>
          )}

          {editing ? (
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-[0.78rem] font-bold uppercase tracking-[0.1em] text-[#5c5e62]">
                  Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={inputCls}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[0.78rem] font-bold uppercase tracking-[0.1em] text-[#5c5e62]">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputCls}
                />
              </div>
              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={handleProfileSave}
                  disabled={savingProfile}
                  className="h-9 rounded-full bg-[#E85C1A] px-5 text-[0.83rem] font-semibold text-white transition hover:bg-[#d44f12] disabled:opacity-60"
                >
                  {savingProfile ? "Saving…" : "Save Changes"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditing(false);
                    setName(profile.name);
                    setEmail(profile.email);
                    setProfileError(null);
                  }}
                  className="h-9 rounded-full border border-black/10 px-5 text-[0.83rem] font-semibold text-[#1a1a1a] transition hover:bg-[#f0f2f5]"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <InfoRow icon={<User size={15} />} label="Name" value={name || "—"} />
              <InfoRow icon={<Mail size={15} />} label="Email" value={email || "—"} />
              <InfoRow
                icon={<Shield size={15} />}
                label="Role"
                value={
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[0.72rem] font-semibold ${
                      ROLE_COLORS[profile.role] ?? "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {ROLE_LABELS[profile.role] ?? profile.role || "—"}
                  </span>
                }
              />
              <InfoRow
                icon={<Clock size={15} />}
                label="Last Login"
                value={formatLastLogin(profile.last_login_at)}
              />
            </div>
          )}
        </div>

        {/* ── Change password card ── */}
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <p className="mb-5 text-[0.7rem] font-bold uppercase tracking-[0.15em] text-[#5c5e62]">
            Change Password
          </p>

          {passwordSuccess && (
            <div className="mb-4 flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-[0.83rem] text-emerald-700">
              <CheckCircle size={14} className="mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold">Password changed successfully.</p>
                <p className="mt-0.5">Other active sessions have been signed out.</p>
              </div>
            </div>
          )}
          {passwordError && (
            <div className="mb-4 flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-[0.83rem] text-red-700">
              <span>{passwordError}</span>
              <button type="button" onClick={() => setPasswordError(null)}>
                <X size={13} />
              </button>
            </div>
          )}

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <PasswordField
              label="Current Password"
              value={currentPassword}
              onChange={setCurrentPassword}
              show={showCurrent}
              onToggle={() => setShowCurrent((v) => !v)}
              fieldError={passwordFieldError ?? undefined}
              required
            />
            <PasswordField
              label="New Password"
              value={newPassword}
              onChange={setNewPassword}
              show={showNew}
              onToggle={() => setShowNew((v) => !v)}
              placeholder="Min. 8 characters"
              required
            />
            <PasswordField
              label="Confirm New Password"
              value={confirmPassword}
              onChange={setConfirmPassword}
              show={showConfirm}
              onToggle={() => setShowConfirm((v) => !v)}
              required
            />
            <div className="pt-1">
              <button
                type="submit"
                disabled={
                  savingPassword ||
                  !currentPassword ||
                  !newPassword ||
                  !confirmPassword
                }
                className="h-9 rounded-full bg-[#E85C1A] px-5 text-[0.83rem] font-semibold text-white transition hover:bg-[#d44f12] disabled:opacity-60"
              >
                {savingPassword ? "Updating…" : "Update Password"}
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}
