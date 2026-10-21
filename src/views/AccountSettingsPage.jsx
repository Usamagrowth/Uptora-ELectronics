import { useEffect, useState } from "react";
import Link from "next/link";
import Head from "next/head";
import { useSession } from "next-auth/react";
import {
  User,
  Lock,
  ChevronRight,
  Loader2,
  Save,
  Shield,
  Mail,
  Phone,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import FormField from "../components/FormField";
import { getCanonicalUrl } from "../lib/site";

function AccountSettingsPage() {
  const { data: session, status } = useSession();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [passwordErrors, setPasswordErrors] = useState({});

  useEffect(() => {
    if (status === "loading" || !session) return;

    async function fetchProfile() {
      setLoading(true);
      setError("");
      try {
        const response = await fetch("/api/user/profile");
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error || "Unable to load profile.");
        setProfile({
          name: payload.user.name || "",
          email: payload.user.email || "",
          phone: payload.user.phone || "",
        });
      } catch (err) {
        setError(err.message || "Unable to load profile.");
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [session, status]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
    setPasswordErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validatePasswordForm = () => {
    const errors = {};
    
    if (!passwordForm.currentPassword) {
      errors.currentPassword = "Current password is required";
    }
    
    if (!passwordForm.newPassword) {
      errors.newPassword = "New password is required";
    } else if (passwordForm.newPassword.length < 6) {
      errors.newPassword = "Password must be at least 6 characters";
    }
    
    if (!passwordForm.confirmPassword) {
      errors.confirmPassword = "Please confirm your password";
    } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }
    
    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: profile.name,
          phone: profile.phone,
        }),
      });

      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Failed to update profile.");

      setSuccess("Profile updated successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    
    if (!validatePasswordForm()) {
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/user/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "change-password",
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Failed to change password.");

      setSuccess("Password changed successfully!");
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message || "Failed to change password.");
    } finally {
      setSaving(false);
    }
  };

  const hasPassword = session?.user?.email && !session.user.email.includes("gmail.com");

  if (!mounted || status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-6">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col items-center justify-center gap-5 p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-brand-100 dark:bg-brand-900/40 flex items-center justify-center">
          <User className="w-8 h-8 text-brand-500" />
        </div>
        <div>
          <p className="text-xl font-bold text-gray-900 dark:text-gray-100">Sign in to your account</p>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Access your account settings.</p>
        </div>
        <Link
          href="/"
          className="rounded-xl bg-brand-500 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-600 transition shadow-lg shadow-brand-200 dark:shadow-brand-900/30"
        >
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Account Settings — Uptora Electronics</title>
        <meta name="description" content="Manage your account settings and password at Uptora Electronics." />
        <meta name="robots" content="noindex, nofollow" />
        <link rel="canonical" href={getCanonicalUrl("/dashboard/settings")} />
      </Head>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-200">
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          {/* Header */}
          <div className="mb-8">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-brand-500 mb-4 transition-colors"
            >
              ← Back to Dashboard
            </Link>
            <p className="text-xs uppercase tracking-[0.25em] text-brand-500 font-semibold mb-1">Account Settings</p>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
              Manage Your Account
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Update your profile information and security settings.
            </p>
          </div>

          {error && (
            <div className="mb-6 rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/40 p-4 text-sm text-red-600 dark:text-red-300 flex items-start gap-2">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-6 rounded-xl border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/40 p-4 text-sm text-green-600 dark:text-green-300 flex items-start gap-2">
              <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{success}</span>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-7 h-7 text-brand-500 animate-spin" />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Profile Information */}
              <section className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
                <div className="px-6 sm:px-8 py-5 border-b border-gray-100 dark:border-gray-800">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <User className="w-5 h-5 text-brand-500" />
                    Profile Information
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                    Update your personal details.
                  </p>
                </div>
                <div className="p-6 sm:p-8">
                  <form onSubmit={handleProfileSave} className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                          Full Name
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={profile.name}
                          onChange={handleProfileChange}
                          disabled={saving}
                          className="w-full px-3 sm:px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                          Email Address
                        </label>
                        <input
                          type="email"
                          value={profile.email}
                          disabled
                          className="w-full px-3 sm:px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 text-sm cursor-not-allowed"
                          title="Email cannot be changed"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={profile.phone}
                        onChange={handleProfileChange}
                        disabled={saving}
                        placeholder="09024988998"
                        inputMode="tel"
                        className="w-full px-3 sm:px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      />
                    </div>
                    <div className="pt-4">
                      <button
                        type="submit"
                        disabled={saving}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-500 text-white text-sm font-semibold hover:bg-brand-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {saving ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4" />
                            Save Changes
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </section>

              {/* Password & Security */}
              <section className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
                <div className="px-6 sm:px-8 py-5 border-b border-gray-100 dark:border-gray-800">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <Lock className="w-5 h-5 text-brand-500" />
                    Password & Security
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                    Manage your password and sign-in methods.
                  </p>
                </div>
                <div className="p-6 sm:p-8 space-y-6">
                  {/* Sign-in Methods */}
                  <div className="rounded-xl bg-gray-50 dark:bg-gray-800/60 p-4 border border-gray-100 dark:border-gray-700">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                      Sign-in Methods
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white dark:bg-gray-700 flex items-center justify-center border border-gray-200 dark:border-gray-600">
                        <Mail className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                          {hasPassword ? "Email & Password" : "Google Sign-in"}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {hasPassword
                            ? "You can sign in with your email and password"
                            : "You can sign in with your Google account"}
                        </p>
                      </div>
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    </div>
                  </div>

                  {/* Password Change Form */}
                  {hasPassword ? (
                    <form onSubmit={handlePasswordSave} className="space-y-4">
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Change Password</p>
                      <div className="space-y-4">
                        <div className="relative">
                          <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                            Current Password
                          </label>
                          <input
                            type={showCurrentPassword ? "text" : "password"}
                            name="currentPassword"
                            value={passwordForm.currentPassword}
                            onChange={handlePasswordChange}
                            disabled={saving}
                            className="w-full px-3 sm:px-4 py-2.5 pr-10 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                          />
                          <button
                            type="button"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            className="absolute right-3 top-8 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          >
                            {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                          {passwordErrors.currentPassword && (
                            <p className="text-xs text-red-500 mt-1">{passwordErrors.currentPassword}</p>
                          )}
                        </div>
                        <div className="relative">
                          <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                            New Password
                          </label>
                          <input
                            type={showNewPassword ? "text" : "password"}
                            name="newPassword"
                            value={passwordForm.newPassword}
                            onChange={handlePasswordChange}
                            disabled={saving}
                            className="w-full px-3 sm:px-4 py-2.5 pr-10 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-3 top-8 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          >
                            {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                          {passwordErrors.newPassword && (
                            <p className="text-xs text-red-500 mt-1">{passwordErrors.newPassword}</p>
                          )}
                        </div>
                        <div className="relative">
                          <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                            Confirm New Password
                          </label>
                          <input
                            type={showConfirmPassword ? "text" : "password"}
                            name="confirmPassword"
                            value={passwordForm.confirmPassword}
                            onChange={handlePasswordChange}
                            disabled={saving}
                            className="w-full px-3 sm:px-4 py-2.5 pr-10 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-8 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          >
                            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                          {passwordErrors.confirmPassword && (
                            <p className="text-xs text-red-500 mt-1">{passwordErrors.confirmPassword}</p>
                          )}
                        </div>
                      </div>
                      <div className="pt-2">
                        <button
                          type="submit"
                          disabled={saving}
                          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-500 text-white text-sm font-semibold hover:bg-brand-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {saving ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Updating...
                            </>
                          ) : (
                            <>
                              <Save className="w-4 h-4" />
                              Update Password
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                      <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                        You signed in using Google. To set a password for your account, please contact{" "}
                        <span className="font-semibold text-brand-600 dark:text-brand-400">uptoraelectronics@gmail.com</span>
                        for assistance.
                      </p>
                    </div>
                  )}

                  {/* Password Reset Link */}
                  <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                    <Link
                      href="/auth/forgot-password"
                      className="inline-flex items-center gap-2 text-sm text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 transition-colors"
                    >
                      <Shield className="w-4 h-4" />
                      Forgot your password? Reset it here
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </section>
            </div>
          )}
        </main>
      </div>
    </>
  );
}

export default AccountSettingsPage;
