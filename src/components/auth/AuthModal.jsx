import { useState } from "react";
import { X } from "lucide-react";
import { signIn } from "next-auth/react";
import EmailAuthForm from "./EmailAuthForm";
import ForgotPasswordForm from "./ForgotPasswordForm";
import { FcGoogle } from "react-icons/fc";

export default function AuthModal({ isOpen, onClose, defaultMode = "login" }) {
  const [mode, setMode] = useState(defaultMode); // login, register, forgot
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await signIn("google", { 
        callbackUrl: "/dashboard", 
        prompt: "select_account" 
      });
      // Modal will close on successful redirect
    } catch (error) {
      console.error("Google sign-in error:", error);
      setLoading(false);
    }
  };

  const handleSuccess = () => {
    // Don't close immediately - let the form handle the redirect
    // The form will show success message and redirect
  };

  const handleModeChange = (newMode) => {
    setMode(newMode);
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6">
          {mode === "forgot" ? (
            <ForgotPasswordForm
              onBack={() => setMode("login")}
              onSuccess={handleSuccess}
            />
          ) : (
            <>
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {mode === "login" ? "Welcome back" : "Create account"}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {mode === "login" ? "Sign in to your account" : "Sign up to get started"}
                </p>
              </div>

              <div className="space-y-4">
                <button
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 border border-gray-300 dark:border-gray-700 rounded-lg py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800 transition disabled:opacity-50"
                >
                  <FcGoogle w-7 h-7 />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Continue with Google
                  </span>
                </button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white dark:bg-gray-900 text-gray-500">
                      Or continue with email
                    </span>
                  </div>
                </div>

                <EmailAuthForm
                  mode={mode}
                  onSuccess={handleSuccess}
                  onModeChange={handleModeChange}
                />

                {mode === "login" && (
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => setMode("forgot")}
                      className="text-sm text-brand-600 dark:text-brand-400 hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}